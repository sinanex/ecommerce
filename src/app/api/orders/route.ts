import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import Product from '@/models/Product';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAuth(req);
    const { items, shippingAddress, paymentMethod, totalAmount, shippingCharge, subtotal, advancePaid, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();

    if (paymentMethod === 'online' && razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 });
      }
    }

    const newOrder = new Order({
      user: auth.user.userId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      shippingCharge,
      subtotal,
      advancePaid: advancePaid || 0,
      razorpayPaymentId,
      paymentStatus: razorpayPaymentId ? 'Paid' : 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Decrease product quantities based on size
    for (const item of items) {
      if (item.product && item.quantity > 0) {
        const prodId = item.product;
        const qty = item.quantity;
        const size = item.size;

        const updateQuery: any = {
          $inc: { stock: -qty }
        };

        if (size) {
          // Try to update both total stock and the specific size stock
          const updateResult = await Product.updateOne(
            { _id: prodId, "sizeStocks.size": size },
            { $inc: { stock: -qty, "sizeStocks.$[elem].stock": -qty } },
            { arrayFilters: [{ "elem.size": size }] }
          );

          // If modifiedCount is 0, it means either the product wasn't found or sizeStocks doesn't have the size
          // In that case, just fallback to decrementing the total stock
          if (updateResult.modifiedCount === 0) {
            await Product.updateOne({ _id: prodId }, { $inc: { stock: -qty } });
          }
        } else {
          // No size specified, just decrement total stock
          await Product.updateOne({ _id: prodId }, { $inc: { stock: -qty } });
        }
      }
    }

    await (User as any).findByIdAndUpdate(auth.user.userId, { $set: { cart: [] } });

    const orderNum = await (Order as any).countDocuments({ _id: { $lte: savedOrder._id } });
    const orderWithNum = {
      ...savedOrder.toObject(),
      orderNumber: String(orderNum).padStart(4, '0')
    };

    return NextResponse.json(orderWithNum, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
