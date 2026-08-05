import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeasurementField {
  _id?: string;
  name: string; // e.g. "Chest", "Length", "Sleeve", "Waist"
  unit: string; // e.g. "inches", "cm"
  required: boolean;
  placeholder?: string;
}

export interface IProduct extends Document {
  name: string; // e.g. "Formal Shirt", "Pajama", "3-Piece Suit"
  category: string; // e.g. "Shirts", "Pants", "Traditional", "Suits"
  basePrice: number;
  description?: string;
  measurementFields: IMeasurementField[];
  createdAt: Date;
  updatedAt: Date;
}

const MeasurementFieldSchema = new Schema({
  name: { type: String, required: true, trim: true },
  unit: { type: String, required: true, default: 'inches' },
  required: { type: Boolean, default: true },
  placeholder: { type: String, default: '' },
});

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'General' },
    basePrice: { type: Number, required: true, default: 0 },
    description: { type: String, default: '' },
    measurementFields: [MeasurementFieldSchema],
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
