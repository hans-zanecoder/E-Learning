import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/app/lib/db';

export interface IStudent extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  enrolledCourses?: string[];
}

const studentSchema = new Schema<IStudent>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
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
    role: {
      type: String,
      enum: ['student'],
      default: 'student',
    },
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export { studentSchema };
export default mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
