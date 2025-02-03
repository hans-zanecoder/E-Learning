import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseId: { type: String, ref: 'Course', required: true },
  questions: [examQuestionSchema],
  totalScore: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam; 