import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [orders, totalProducts] = await Promise.all([
      Order.find({}),
      Product.countDocuments({}),
    ]);

    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) =>
      ['Pending', 'In Progress', 'Fitting Ready'].includes(o.status)
    ).length;
    const readyOrders = orders.filter((o) => o.status === 'Fitting Ready' || o.status === 'Completed').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingDue = orders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Delivered')
      .reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

    const recentOrders = orders.slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        readyOrders,
        deliveredOrders,
        totalRevenue,
        pendingDue,
        totalProducts,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error('Fetch stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
