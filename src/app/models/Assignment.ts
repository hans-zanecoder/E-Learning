import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const assignmentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseId: { type: String, ref: 'Course', required: true },
  dueDate: { type: Date, required: true },
  fileRequired: { type: Boolean, default: false },
  submissions: [{
    studentId: { type: String, ref: 'Student' },
    fileUrl: String,
    submissionText: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  strict: true
});

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema); 