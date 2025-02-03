import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface IAdmin extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  fullName: string;
}

const adminSchema = new Schema<IAdmin>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
export default Admin;
