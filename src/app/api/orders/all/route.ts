import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    let auth;
    try {
      auth = verifyAuth(req);
    } catch (authError: any) {
      return NextResponse.json({ message: authError.message }, { status: 401 });
    }
    if (!auth.isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    const orders = await (Order as any).find().populate('user', 'phone name').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
