import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IExam extends Document {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  totalScore: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseId: { type: String, ref: 'Course', required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }
  }],
  totalScore: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  strict: true
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam; 