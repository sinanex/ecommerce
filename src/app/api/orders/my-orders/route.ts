import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    const orders = await (Order as any).find({ user: auth.user.userId }).sort({ createdAt: -1 });
    
    const ordersWithNumber = await Promise.all(orders.map(async (order: any) => {
      const orderNum = await (Order as any).countDocuments({ _id: { $lte: order._id } });
      return {
        ...order.toObject(),
        orderNumber: String(orderNum).padStart(4, '0')
      };
    }));

    return NextResponse.json(ordersWithNumber);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
