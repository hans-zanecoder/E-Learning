import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IEnrollment extends Document {
  _id: string;
  courseId: string;
  studentId: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'dropped';
  completedLessons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    courseId: {
      type: String,
      ref: 'Course',
      required: [true, 'Please provide a course ID'],
    },
    studentId: {
      type: String,
      ref: 'Student',
      required: [true, 'Please provide a student ID'],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
    completedLessons: [
      {
        type: String,
        ref: 'Lesson',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export { enrollmentSchema };
export default mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
