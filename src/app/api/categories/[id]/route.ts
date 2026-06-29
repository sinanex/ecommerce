import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { verifyAuth } from '@/lib/auth';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    verifyAuth(req);
    const id = (await params).id;
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const image = formData.get('image') as File | null;
    
    if (!name) return NextResponse.json({ message: 'Category name is required' }, { status: 400 });

    const category = await (Category as any).findById(id);
    if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

    const existingCategory = await (Category as any).findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: id } });
    if (existingCategory) return NextResponse.json({ message: 'Category name already exists' }, { status: 400 });

    category.name = name;
    
    if (image) {
      if (category.imageUrl) {
        try {
          await deleteFromCloudinary(category.imageUrl);
        } catch (e) {
          console.error("Failed to delete old image", e);
        }
      }
      category.imageUrl = await uploadToCloudinary(image, 'kitbay/categories');
    }

    await category.save();
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    verifyAuth(req);
    const id = (await params).id;
    const category = await (Category as any).findByIdAndDelete(id);
    if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

    if (category.imageUrl) {
      try {
        await deleteFromCloudinary(category.imageUrl);
      } catch (e) {
        console.error("Failed to delete category image from Cloudinary", category.imageUrl, e);
      }
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
