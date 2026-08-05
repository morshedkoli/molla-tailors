import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

const PURE_BANGLA_PRODUCTS = [
  {
    name: 'জেন্টস শার্ট',
    category: 'শার্ট',
    basePrice: 650,
    description: 'ফরমাল ও ক্যাজুয়াল ফিটিং পুরুষদের শার্ট সেলাই',
    measurementFields: [
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৯.৫' },
      { name: 'বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪০' },
      { name: 'কোমর', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ৩৮' },
      { name: 'কাঁধ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৮' },
      { name: 'হাতা', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৪.৫' },
      { name: 'কলার', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৫.৫' },
      { name: 'কাফ', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ৯' },
    ],
  },
  {
    name: 'পাঞ্জাবী ও কুর্তা',
    category: 'ঐতিহ্যবাহী',
    basePrice: 850,
    description: 'কাস্টম কলার ও কাফ সহ প্রিমিয়াম পাঞ্জাবী সেলাই',
    measurementFields: [
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪২' },
      { name: 'বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪১' },
      { name: 'কোমর', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ৩৯' },
      { name: 'কাঁধ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৮.৫' },
      { name: 'হাতা', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৫' },
      { name: 'কলার', unit: 'ইঞ্চি', required: true, placeholder: '<ctrl42>যেমন: ১৬' },
      { name: 'ঘের', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ২৬' },
    ],
  },
  {
    name: 'পায়জামা ও ট্রাউজার',
    category: 'প্যান্ট',
    basePrice: 550,
    description: 'ফরমাল পায়জামা বা সুতির ট্রাউজার প্যান্ট',
    measurementFields: [
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৯' },
      { name: 'কোমর', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৪' },
      { name: 'হিপ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪২' },
      { name: 'থাই', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ২৫' },
      { name: 'ইনসিম', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ২৯' },
      { name: 'মোহরী', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৪' },
    ],
  },
  {
    name: 'ফরমাল স্যুট (২ পিস)',
    category: 'স্যুট',
    basePrice: 4500,
    description: 'প্রিমিয়াম জ্যাকেট ও প্যান্ট স্যুট সেলাই',
    measurementFields: [
      { name: 'জ্যাকেট দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩০' },
      { name: 'বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪২' },
      { name: 'জ্যাকেট কোমর', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৮' },
      { name: 'কাঁধ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৯' },
      { name: 'হাতা', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৫' },
      { name: 'প্যান্ট দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪০' },
      { name: 'প্যান্ট কোমর', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৬' },
      { name: 'প্যান্ট মোহরী', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৫' },
    ],
  },
  {
    name: 'শেরওয়ানী',
    category: 'ঐতিহ্যবাহী',
    basePrice: 5500,
    description: 'বরের বা উৎসবের শাহী শেরওয়ানী সেলাই',
    measurementFields: [
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪৪' },
      { name: 'বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪২' },
      { name: 'কোমর', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪০' },
      { name: 'কাঁধ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৯' },
      { name: 'হাতা', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৬' },
      { name: 'কলার', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৬.৫' },
    ],
  },
  {
    name: 'লেডিস কামিজ ও কুর্তি',
    category: 'থ্রি-পিস',
    basePrice: 750,
    description: 'মহিলাদের সালোয়ার কামিজ ও সুতির কুর্তি সেলাই',
    measurementFields: [
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪৪' },
      { name: 'বডি/বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৮' },
      { name: 'কোমর', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৪' },
      { name: 'হিপ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪০' },
      { name: 'পুট/কাঁধ', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৪' },
      { name: 'হাতা', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৭' },
      { name: 'গলার চওড়া', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ৬' },
    ],
  },
  {
    name: 'লেডিস সালোয়ার ও প্লাজো',
    category: 'সালোয়ার',
    basePrice: 450,
    description: 'মহিলাদের সালোয়ার, প্লাজো বা প্যান্ট পায়জামা',
    measurementFields: [
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩৮' },
      { name: 'কোমর', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৩২' },
      { name: 'থাই', unit: 'ইঞ্চি', required: false, placeholder: 'যেমন: ২৬' },
      { name: 'মোহরী', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ১৮' },
    ],
  },
];

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset');

    // Auto cleanup any existing English products if reset flag passed or if any product has English letters
    const existingProducts = await Product.find({});
    const hasEnglish = existingProducts.some((p) => /[a-zA-Z]/.test(p.name));

    if (reset === 'true' || existingProducts.length === 0 || hasEnglish) {
      await Product.deleteMany({});
      await Product.insertMany(PURE_BANGLA_PRODUCTS);
    }

    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: error.message || 'প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'অপ্রমাণিত এক্সেস' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, category, basePrice, description, measurementFields } = body;

    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'প্রোডাক্টের নাম এবং বেস দাম আবশ্যক' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name,
      category: category || 'সাধারণ',
      basePrice: Number(basePrice),
      description: description || '',
      measurementFields: measurementFields || [],
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'প্রোডাক্ট তৈরি করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}

// Reset route handler for explicit re-seeding
export async function DELETE() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'অপ্রমাণিত এক্সেস' }, { status: 401 });
    }

    await connectToDatabase();
    await Product.deleteMany({});
    await Product.insertMany(PURE_BANGLA_PRODUCTS);

    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      message: 'সকল ইংরেজি প্রোডাক্ট মুছে সম্পূর্ণ বাংলা প্রোডাক্ট রিসিড করা হয়েছে',
      products,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
