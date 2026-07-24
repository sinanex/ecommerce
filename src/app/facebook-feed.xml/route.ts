import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { escapeXml, slugify, toAbsoluteUrl } from '@/lib/feed';

// Force Next.js to run this dynamic route on every request to fetch fresh data from MongoDB
export const dynamic = 'force-dynamic';

/**
 * GET route handler for /facebook-feed.xml
 * Generates an XML RSS feed for Meta Commerce Catalog import.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Establish connection to MongoDB
    await dbConnect();

    // 2. Resolve Base URL for absolute links
    const host = req.headers.get('host') || '6yardjersey.com';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    // 3. Setup Streaming of XML content to handle large catalog sizes efficiently
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Enqueue RSS and Channel header tags
          controller.enqueue(
            encoder.encode(
              `<?xml version="1.0" encoding="UTF-8"?>\n` +
              `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n` +
              `  <channel>\n` +
              `    <title>${escapeXml('6yard Jersey Store')}</title>\n` +
              `    <link>${escapeXml(baseUrl)}</link>\n` +
              `    <description>${escapeXml('Meta Commerce Catalog Feed containing dynamic products and variants')}</description>\n`
            )
          );

          // 4. Query available products using MongoDB cursor to stream memory-efficiently
          // We select only the necessary fields required to populate the feed items
          const cursor = (Product as any)
            .find({ isAvailable: true })
            .select('_id name description brand category subcategory price discount_price currency images stock isAvailable slug')
            .lean()
            .cursor();

          for (let product = await cursor.next(); product != null; product = await cursor.next()) {
            // Map product link to product page ID route
            const link = toAbsoluteUrl(`/product/${product._id.toString()}`, baseUrl);

            // Determine main image link
            let mainImage = '';
            if (product.images && product.images.length > 0) {
              mainImage = product.images[0];
            } else if (product.image) {
              mainImage = product.image;
            } else {
              // Fallback to placeholder/icon if no image exists
              mainImage = '/icon.png';
            }
            const imageLink = toAbsoluteUrl(mainImage, baseUrl);

            // Handle additional image links (up to 10)
            let additionalImagesXml = '';
            if (product.images && product.images.length > 1) {
              const extraImages = product.images.slice(1, 11); // Meta allows up to 10 additional images
              for (const img of extraImages) {
                additionalImagesXml += `        <g:additional_image_link>${escapeXml(toAbsoluteUrl(img, baseUrl))}</g:additional_image_link>\n`;
              }
            }

            // Determine availability: in stock or out of stock
            const isInstock = product.isAvailable && product.stock !== undefined && product.stock > 0;
            const availability = isInstock ? 'in stock' : 'out of stock';

            // Determine price: use discount_price if available, otherwise fallback to base price
            const currency = product.currency || 'INR';
            const priceVal = product.discount_price !== undefined && product.discount_price !== null
              ? product.discount_price
              : product.price;
            const formattedPrice = `${priceVal} ${currency}`;

            // Build product type breadcrumb string
            let productType = '';
            if (Array.isArray(product.category)) {
              productType = product.category.join(' > ');
            } else if (typeof product.category === 'string') {
              productType = product.category;
            }
            if (product.subcategory) {
              productType = productType ? `${productType} > ${product.subcategory}` : product.subcategory;
            }
            if (!productType) {
              productType = 'General';
            }

            const brand = product.brand || '6yard';

            // Format standard RSS feed item XML segment
            const productXml = 
              `      <item>\n` +
              `        <g:id>${escapeXml(product._id.toString())}</g:id>\n` +
              `        <g:title>${escapeXml(product.name)}</g:title>\n` +
              `        <g:description>${escapeXml(product.description || product.name)}</g:description>\n` +
              `        <g:link>${escapeXml(link)}</g:link>\n` +
              `        <g:image_link>${escapeXml(imageLink)}</g:image_link>\n` +
              additionalImagesXml +
              `        <g:availability>${escapeXml(availability)}</g:availability>\n` +
              `        <g:price>${escapeXml(formattedPrice)}</g:price>\n` +
              `        <g:brand>${escapeXml(brand)}</g:brand>\n` +
              `        <g:condition>new</g:condition>\n` +
              `        <g:product_type>${escapeXml(productType)}</g:product_type>\n` +
              `      </item>\n`;

            controller.enqueue(encoder.encode(productXml));
          }

          // Enqueue footer tags and close stream
          controller.enqueue(encoder.encode(`  </channel>\n</rss>\n`));
          controller.close();
        } catch (streamError: any) {
          console.error('Error during XML stream generation:', streamError);
          // Enqueue a comment with the error and close stream to prevent hanging requests
          controller.enqueue(encoder.encode(`<!-- Error during feed generation: ${escapeXml(streamError.message)} -->\n`));
          controller.enqueue(encoder.encode(`  </channel>\n</rss>\n`));
          controller.close();
        }
      }
    });

    // 5. Return Response with application/xml content type
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    console.error('Failed to generate Facebook feed:', error);
    
    // In case of high-level initialization failure, return a static valid XML showing error details
    const errorXml = 
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n` +
      `  <channel>\n` +
      `    <title>6yard Jersey Store</title>\n` +
      `    <link>https://6yardjersey.com</link>\n` +
      `    <description>Meta Commerce Catalog Feed - System Error</description>\n` +
      `    <!-- Error details: ${escapeXml(error.message)} -->\n` +
      `  </channel>\n</rss>\n`;

    return new Response(errorXml, {
      status: 200, // Return 200 so Meta's validator reads the XML rather than throwing a raw HTTP error
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
