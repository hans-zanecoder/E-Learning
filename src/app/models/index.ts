import mongoose from 'mongoose';
import { teacherSchema } from './Teacher';
import { courseSchema } from './Course';
import { studentSchema } from './Student';
import { enrollmentSchema } from './Enrollment';

// Register all models
export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);