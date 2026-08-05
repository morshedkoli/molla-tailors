# ✂️ Molla Tailors - টেইলর অর্ডার ম্যানেজমেন্ট সিস্টেম

**মোল্লা টেইলরস (Molla Tailors)** হলো একটি আধুনিক, সুসংগঠিত ও ফিচার-সমৃদ্ধ টেলারিং ও সেলাই অর্ডার ম্যানেজমেন্ট ওয়েব অ্যাপ্লিকেশন। এটি টেইলর শপ, ড্রেসমেকিং ও বিসপোক ক্লথিং ওয়ার্কশপের গ্রাহকদের অর্ডার বুকিং, পোশাকের বডি পরিমাপ (Body Measurements), জমা-বকেয়ার হিসাব এবং এইচডি ডিজিটাল রসিদ শেয়ারিং সহজ করার জন্য তৈরি করা হয়েছে।

---

## ✨ প্রধান বৈচিত্র্যময় ফিচারসমূহ (Key Features)

- 🇧🇩 **১০০% বাংলা ভাষা ও কালপুরুষ ফন্ট**:
  - পুরো অ্যাপ্লিকেশনটিতে 'কালপুরুষ' (Kalpurush) ফন্ট ব্যবহার করা হয়েছে যাতে সব লেখা স্পষ্ট ও দৃষ্টিনন্দন দেখায়।
- 👕 **প্রোডাক্ট ও ডাইনামিক মাপের লাইব্রেরি (Custom Measurement Fields)**:
  - জেন্টস শার্ট, পাঞ্জাবী, কাস্টম স্যুট, সালোয়ার-কামিজ ইত্যাদির জন্য প্রয়োজনীয় পরিমাপের ঘরগুলো (যেমন: দৈর্ঘ্য, বুক, হাতা, কলার, কোমর ইত্যাদি) ডাইনামিকভাবে কাস্টমাইজ করার সুবিধা।
- 💰 **যোগমূলক হিসাব (Cumulative Billing System)**:
  - নতুন টাকা জমা দিলে তা পূর্বের জমার সাথে যোগ হয় (`পূর্বের জমা + নতুন জমা = মোট জমা`), ফলে হিসাব থাকে নির্ভুল ও স্বচ্ছ।
- 📸 **রসিদের ছবি শেয়ার ও ডাউনলোড (HD Photo Receipt Share)**:
  - এক ক্লিকে হাই-ডেফিনিশন (2x HD) রসিদ ইমেজ তৈরি করে গ্যালারিতে ডাউনলোড বা হোয়াটসঅ্যাপের মাধ্যমে গ্রাহককে সরাসরি ছবি পাঠাবার সুবিধা।
- 🎨 **ডাইনামিক শপ ব্র্যান্ডিং সেটিংস (Dynamic Shop Branding)**:
  - এডমিন সেটিংস পেজ থেকে সহজেই শপের নাম ("মোল্লা টেইলরস"), স্লোগান, ঠিকানা, হেল্পলাইন নম্বর এবং রসিদের শর্তাবলী পরিবর্তন করা যায়।
- 🏷️ **বাংলা অর্ডার স্ট্যাটাস ট্র্যাকিং**:
  - কালার-কোডেড ব্যাজ সহ কাজের প্রতিটি ধাপ ট্র্যাক করুন: `অপেক্ষমাণ (পেন্ডিং)`, `কাটিং চলছে`, `সেলাই চলছে`, `ট্রায়াল / ফিটিং`, `ডেলিভারির জন্য তৈরি`, `ডেলিভারি সম্পন্ন`, `বাতিলকৃত`।

---

## 🛠️ ব্যবহৃত টেকনোলজি (Tech Stack)

- **ফ্রন্টএন্ড ও ব্যাকএন্ড**: Next.js 16 (App Router), React 19, TypeScript
- **স্টাইলিং**: Tailwind CSS v4, Lucide Icons, Glassmorphic UI Design
- **ডাটাবেস**: MongoDB with Mongoose ORM
- **অ্যAuthentication**: JWT Cookie-based Authentication
- **রসিদ ফটো রেন্ডারিং**: Modern-Screenshot (`domToPng`)

---

## 🚀 লোকাল সেটআপ নির্দেশিকা (Local Setup Guide)

### ১. প্রজেক্ট ক্লোন করুন:
```bash
git clone https.github.com/morshedkoli/molla-tailors.git
cd molla-tailors
```

### ২. ডিপেন্ডেন্সি ইনস্টল করুন:
```bash
npm install
```

### ৩. এনভারায়রনমেন্ট ভেরিয়েবল সেটআপ করুন:
প্রজেক্টের রুট ডিরেক্টরিতে `.env.local` ফাইল তৈরি করুন এবং নিচের মানগুলো সেট করুন:
```env
MONGODB_URI=mongodb://localhost:27017/trailor
JWT_SECRET=your_secret_jwt_key_here
NODE_ENV=development
```

### ৪. ডেভেলপমেন্ট সার্ভার চালু করুন:
```bash
npm run dev
```
ব্রাউজারে এ ক্লিক করুন: `http://localhost:3000`

---

## 🔑 ডিফল্ট লগইন ক্রিডেনশিয়াল (Default Credentials)

অ্যাডমিন একাউন্টে লগইন করতে ব্যবহার করুন:
- **ইউজারনেম**: `admin`
- **পাসওয়ার্ড**: `admin123`

*(লগইন সমস্যা হলে ব্রাউজারে `http://localhost:3000/api/auth/seed` রুটটি হিট করে অ্যাডমিন অ্যাকাউন্টটি রিসেট করে নিতে পারেন।)*

---

## 📜 প্রজেক্ট ডিরেক্টরি স্ট্রাকচার (Project Structure)

```
molla-tailors/
├── app/
│   ├── api/             # Next.js API Routes (Auth, Orders, Products, Settings)
│   ├── login/           # Admin Login Screen
│   ├── orders/          # Order Directory, New Order & Detailed Receipt Views
│   ├── products/       # Tailor Products & Measurement Library Manager
│   └── settings/       # Shop Branding & Terms Settings
├── components/          # Reusable UI Components (Navbar, StatusBadge, etc.)
├── models/              # MongoDB Mongoose Schemas (Admin, Order, Product, Settings)
├── lib/                 # Utilities, Auth helpers & Database Connection
└── public/              # Brand Logo, Favicons and Static Assets
```

---

## 📄 লাইসেন্স (License)

এই প্রজেক্টটি **MIT License**-এর অধীনে প্রকাশিত। 

Developed with ❤️ for **Molla Tailors**.
