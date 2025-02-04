import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const lessonSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  courseId: { type: String, ref: 'Course', required: true },
  studentProgress: [{
    studentId: { type: String, ref: 'Student' },
    completed: { type: Boolean, default: false }
  }],
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  strict: true
});

// Don't create the model here, export the schema instead
export default mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

interface Lesson {
  _id: string;
  title: string;
  content: string;
  courseId: string;
  studentProgress: {
    studentId: string;
    completed: boolean;
  }[];
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}