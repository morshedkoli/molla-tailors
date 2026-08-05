import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { customer, items, advancePaid = 0, deliveryDate, notes, status } = body;

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json(
        { error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item/work is required for the order' },
        { status: 400 }
      );
    }

    if (!deliveryDate) {
      return NextResponse.json(
        { error: 'Delivery date is required' },
        { status: 400 }
      );
    }

    // Calculate total amount from items
    const totalAmount = items.reduce((sum: number, item: any) => {
      const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
      return sum + itemTotal;
    }, 0);

    const advance = Number(advancePaid) || 0;
    const balanceAmount = Math.max(0, totalAmount - advance);
    const orderNumber = generateOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
      },
      items: items.map((i: any) => ({
        productId: i.productId || undefined,
        productName: i.productName,
        unitPrice: Number(i.unitPrice || 0),
        quantity: Number(i.quantity || 1),
        totalPrice: Number(i.unitPrice || 0) * Number(i.quantity || 1),
        measurements: i.measurements || {},
        specialNotes: i.specialNotes || '',
      })),
      totalAmount,
      advancePaid: advance,
      balanceAmount,
      status: status || 'Pending',
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      notes: notes || '',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
