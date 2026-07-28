import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    const resolvedParams = await params;
    
    const order = await (Order as any).findOne({ _id: resolvedParams.id, user: auth.user.userId });
    
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    const orderNum = await (Order as any).countDocuments({ _id: { $lte: order._id } });
    
    return NextResponse.json({
      ...order.toObject(),
      orderNumber: String(orderNum).padStart(4, '0')
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
