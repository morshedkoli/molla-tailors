import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus =
  | 'Pending'
  | 'In Progress'
  | 'Fitting Ready'
  | 'Completed'
  | 'Delivered'
  | 'Cancelled';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId | string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  measurements: Record<string, string>; // Dynamic Key-Value measurements e.g. { "Chest": "40 in", "Length": "38 in" }
  specialNotes?: string;
}

export interface ICustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: ICustomer;
  items: IOrderItem[];
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  unitPrice: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true, default: 0 },
  measurements: { type: Map, of: String, default: {} },
  specialNotes: { type: String, default: '' },
});

const CustomerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
});

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: CustomerSchema, required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    advancePaid: { type: Number, required: true, default: 0 },
    balanceAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Fitting Ready', 'Completed', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
