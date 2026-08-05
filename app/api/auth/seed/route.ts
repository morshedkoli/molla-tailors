import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const username = (searchParams.get('username') || 'admin').toLowerCase();
    const password = searchParams.get('password') || 'admin123';
    const name = searchParams.get('name') || 'মাস্টার টেইলর এডমিন';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert admin credentials
    const admin = await Admin.findOneAndUpdate(
      { username },
      { username, password: hashedPassword, name },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `এডমিন অ্যাকাউন্টের লগইন তথ্য সফলভাবে তৈরি/আপডেট করা হয়েছে!`,
      credentials: {
        username: admin.username,
        password: password,
        name: admin.name,
      },
    });
  } catch (error: any) {
    console.error('Admin seed error:', error);
    return NextResponse.json(
      {
        error: error.message || 'এডমিন অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে',
        tip: 'আপনার .env.local ফাইলে MONGODB_URI ঠিক আছে কিনা পরীক্ষা করুন।',
      },
      { status: 500 }
    );
  }
}
