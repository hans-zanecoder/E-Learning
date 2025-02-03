import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseId: { type: String, ref: 'Course', required: true },
  dueDate: { type: Date, required: true },
  totalScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
export default Assignment; 