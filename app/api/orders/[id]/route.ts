import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (body.status !== undefined) {
      existingOrder.status = body.status;
    }

    // Accumulate new payment with previous advance amount
    if (body.additionalPayment !== undefined) {
      const addAmount = Number(body.additionalPayment);
      if (addAmount > 0) {
        existingOrder.advancePaid = Math.min(
          existingOrder.totalAmount,
          existingOrder.advancePaid + addAmount
        );
        existingOrder.balanceAmount = Math.max(
          0,
          existingOrder.totalAmount - existingOrder.advancePaid
        );
      }
    } else if (body.advancePaid !== undefined) {
      existingOrder.advancePaid = Number(body.advancePaid);
      existingOrder.balanceAmount = Math.max(
        0,
        existingOrder.totalAmount - existingOrder.advancePaid
      );
    }

    if (body.notes !== undefined) {
      existingOrder.notes = body.notes;
    }

    if (body.deliveryDate !== undefined) {
      existingOrder.deliveryDate = new Date(body.deliveryDate);
    }

    await existingOrder.save();

    return NextResponse.json({ success: true, order: existingOrder });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
