import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  examId: { type: String, ref: 'Exam', required: true },
  studentId: { type: String, ref: 'Student', required: true },
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ExamResult || mongoose.model('ExamResult', examResultSchema);