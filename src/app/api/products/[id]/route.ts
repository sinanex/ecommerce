import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const id = (await params).id;
    const product = await (Product as any).findById(id);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    if (!auth.isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    const id = (await params).id;
    const oldProduct = await (Product as any).findById(id);
    if (!oldProduct) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const formData = await req.formData();
    const updateQuery: any = {};
    
    // Copy all text fields
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && key !== 'images' && key !== 'imageSlots') {
        updateQuery[key] = value;
      }
    }

    if (typeof updateQuery.sizes === 'string') {
      try { updateQuery.sizes = JSON.parse(updateQuery.sizes); } catch (e) {}
    }
    if (typeof updateQuery.category === 'string' && updateQuery.category.startsWith('[')) {
      try { updateQuery.category = JSON.parse(updateQuery.category); } catch (e) {}
    }
    if (typeof updateQuery.colors === 'string') {
      try { updateQuery.colors = JSON.parse(updateQuery.colors); } catch (e) {}
    }
    if (typeof updateQuery.sizeStocks === 'string') {
      try { updateQuery.sizeStocks = JSON.parse(updateQuery.sizeStocks); } catch (e) {}
    }

    if (updateQuery.sizeStocks && Array.isArray(updateQuery.sizeStocks)) {
      let totalStock = 0;
      const validSizes: string[] = [];
      updateQuery.sizeStocks.forEach((s: any) => {
        const qty = Number(s.stock);
        if (!isNaN(qty)) {
          totalStock += qty;
          if (s.size) validSizes.push(s.size);
        }
      });
      updateQuery.stock = totalStock;
      updateQuery.sizes = validSizes;
    }

    const imageSlots = formData.get('imageSlots') as string;
    if (imageSlots) {
      const slots = JSON.parse(imageSlots);
      const newFiles = formData.getAll('images') as File[];
      let fileIndex = 0;
      
      const finalImages = [];
      for (const slot of slots) {
        if (slot.startsWith('new_')) {
          if (newFiles[fileIndex]) {
            const url = await uploadToCloudinary(newFiles[fileIndex], 'kitbay/products');
            finalImages.push(url);
            fileIndex++;
          }
        } else if (slot !== 'empty') {
          finalImages.push(slot);
        }
      }
      updateQuery.images = finalImages;
    } else {
      const newFiles = formData.getAll('images') as File[];
      if (newFiles.length > 0) {
        const uploadedUrls = [];
        for (const file of newFiles) {
          uploadedUrls.push(await uploadToCloudinary(file, 'kitbay/products'));
        }
        updateQuery.images = uploadedUrls;
      }
    }

    if (updateQuery.price !== undefined && updateQuery.price !== '') updateQuery.price = Number(updateQuery.price);
    
    const unsetFields: any = {};
    if (updateQuery.discount_price === '' || updateQuery.discount_price == null) {
      delete updateQuery.discount_price;
      unsetFields.discount_price = 1;
    } else {
      updateQuery.discount_price = Number(updateQuery.discount_price);
    }

    if (updateQuery.stock === '' || updateQuery.stock == null) {
      updateQuery.stock = 0;
    } else {
      updateQuery.stock = Number(updateQuery.stock);
    }

    ['brand', 'team', 'subcategory'].forEach(field => {
      if (updateQuery[field] === '') {
        delete updateQuery[field];
        unsetFields[field] = 1;
      }
    });

    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    // Delete orphaned images from Cloudinary
    if (updateQuery.images && Array.isArray(oldProduct.images)) {
      const newImages = updateQuery.images as string[];
      for (const oldImg of oldProduct.images) {
        if (!newImages.includes(oldImg)) {
          try {
            await deleteFromCloudinary(oldImg);
          } catch (e) {
            console.error("Failed to delete orphaned product image", oldImg, e);
          }
        }
      }
    }

    const updatedProduct = await (Product as any).findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true });
    if (!updatedProduct) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    if (!auth.isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    const id = (await params).id;
    const deletedProduct = await (Product as any).findByIdAndDelete(id);
    if (!deletedProduct) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    if (deletedProduct.images && Array.isArray(deletedProduct.images)) {
      for (const imgUrl of deletedProduct.images) {
        try {
          await deleteFromCloudinary(imgUrl);
        } catch (e) {
          console.error("Failed to delete image from Cloudinary", imgUrl, e);
        }
      }
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
