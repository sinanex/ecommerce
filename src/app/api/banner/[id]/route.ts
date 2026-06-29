import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/models/Banner';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const id = (await params).id;
    const oldBanner = await (Banner as any).findById(id);
    if (!oldBanner) return NextResponse.json({ message: 'Banner not found' }, { status: 404 });

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const buttonText = formData.get('buttonText') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const image = formData.get('image') as File | null;

    const updateData: any = { title, subtitle, buttonText, linkUrl };
    
    if (image) {
      if (oldBanner.imageUrl) {
        try {
          await deleteFromCloudinary(oldBanner.imageUrl);
        } catch (e) {
          console.error("Failed to delete old banner image", e);
        }
      }
      updateData.imageUrl = await uploadToCloudinary(image, 'kitbay/banners');
    }

    const banner = await (Banner as any).findByIdAndUpdate(id, updateData, { new: true });
    if (!banner) return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    
    return NextResponse.json(banner);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const id = (await params).id;
    const banner = await (Banner as any).findByIdAndDelete(id);
    if (!banner) return NextResponse.json({ message: 'Banner not found' }, { status: 404 });

    if (banner.imageUrl) {
      try {
        await deleteFromCloudinary(banner.imageUrl);
      } catch (e) {
        console.error("Failed to delete banner image from Cloudinary", banner.imageUrl, e);
      }
    }

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
