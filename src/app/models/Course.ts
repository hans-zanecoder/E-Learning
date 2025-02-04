import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICourse extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  lessons: string[];
  assignments: string[];
  quizzes: string[];
  exams: string[];
  createdAt: Date;
  updatedAt: Date;
  teacherId: string;
  enrolledStudents: string[];
}

const courseSchema = new Schema<ICourse>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a course category'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    teacherId: {
      type: String,
      ref: 'Teacher',
      required: false,
    },
    enrolledStudents: [
      {
        type: String,
        ref: 'Student',
      },
    ],
    lessons: [
      {
        type: String,
        ref: 'Lesson'
      }
    ],
    assignments: [
      {
        type: String,
        ref: 'Assignment',
      },
    ],
    quizzes: [
      {
        type: String,
        ref: 'Quiz',
      },
    ],
    exams: [
      {
        type: String,
        ref: 'Exam',
      },
    ],
  },
  {
    timestamps: true,
    _id: false,
    strict: true,
  }
);

export { courseSchema };
export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);