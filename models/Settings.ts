import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  termsAndConditions: string;
  footerNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    shopName: { type: String, required: true, default: 'THREAD & CRAFT TAILORS' },
    tagline: { type: String, default: 'Bespoke Tailor & Sewing Workshop' },
    address: { type: String, default: 'House 42, Road 11, Banani / Dhanmondi, Dhaka' },
    phone: { type: String, default: '+880 1700-000000' },
    email: { type: String, default: 'info@threadcraft.com' },
    currencySymbol: { type: String, default: '৳' },
    termsAndConditions: {
      type: String,
      default:
        '1. Goods once stitched cannot be returned or exchanged.\n2. Please bring this original receipt during fitting trial or final collection.\n3. Balance must be cleared upon delivery.',
    },
    footerNote: { type: String, default: 'Thank you for choosing Thread & Craft Tailors!' },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
