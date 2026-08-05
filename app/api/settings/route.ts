import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getAuthUser } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  shopName: 'মোল্লা টেইলরস (Molla Tailors)',
  tagline: 'বিসপোক টেইলর ও সেলাই ওয়ার্কশপ',
  address: 'হাউজ ৪২, রোড ১১, বনানী / ধানমন্ডি, ঢাকা',
  phone: '+৮৮০ ১৭০০-০০০০০০',
  email: 'info@mollatailors.com',
  currencySymbol: '৳',
  termsAndConditions:
    '১. সেলাইকৃত কাপড় পরিবর্তন বা ফেরতযোগ্য নহে।\n২. ক্যাটালগ অনুযায়ী ট্রায়াল ও ডেলিভারির সময় এই রসিদ প্রদর্শন করুন।\n৩. ডেলিভারির সময় অবশিষ্ট বকেয়া পরিশোধ করতে হবে।',
  footerNote: 'মোল্লা টেইলরস এ অর্ডার করার জন্য আপনাকে ধন্যবাদ!',
};

export async function GET() {
  try {
    try {
      await connectToDatabase();
      let settings = await Settings.findOne({});
      if (settings) {
        // Automatically update shopName if it's still default thread & craft
        if (!settings.shopName || settings.shopName.includes('থ্রেড এন্ড ক্রাফট')) {
          settings.shopName = 'মোল্লা টেইলরস (Molla Tailors)';
          settings.footerNote = 'মোল্লা টেইলরস এ অর্ডার করার জন্য আপনাকে ধন্যবাদ!';
          await settings.save();
        }
        return NextResponse.json({ success: true, settings });
      }
    } catch (dbErr) {
      console.warn('Database error when reading settings, using defaults:', dbErr);
    }

    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'অপ্রমাণিত এক্সেস (Unauthorized)' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const existing = await Settings.findOne({});
    let updated;

    if (existing) {
      updated = await Settings.findByIdAndUpdate(existing._id, body, {
        new: true,
        runValidators: true,
      });
    } else {
      updated = await Settings.create(body);
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: error.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
