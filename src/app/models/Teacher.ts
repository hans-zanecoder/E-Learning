import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Course from './Course';

export interface ITeacher extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  fullName: string;
  courses: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
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
    role: {
      type: String,
      enum: ['teacher'],
      default: 'teacher',
    },
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
    },
    courses: {
      type: [String],
      ref: 'Course',
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    _id: false,
    strict: true,
  }
);

teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Teacher =
  mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', teacherSchema);
export default Teacher;
