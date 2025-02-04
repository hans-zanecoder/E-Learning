import mongoose from 'mongoose';
import { lessonSchema } from './Lesson';
import { courseSchema } from './Course';
import { teacherSchema } from './Teacher';
import { studentSchema } from './Student';
import examSchema from './Exam';
import { enrollmentSchema } from './Enrollment';
import adminSchema from './Admin';

const registerModel = <T>(modelName: string, schema: mongoose.Schema | mongoose.Model<T>) => {
  if (schema instanceof mongoose.Model) {
    return schema as mongoose.Model<T>;
  }
  return mongoose.models[modelName] || mongoose.model<T>(modelName, schema as mongoose.Schema);
};

export const Lesson = registerModel('Lesson', lessonSchema);
export const Course = registerModel('Course', courseSchema);
export const Teacher = registerModel('Teacher', teacherSchema);
export const Student = registerModel('Student', studentSchema);
export const Exam = registerModel('Exam', examSchema);
export const Enrollment = registerModel('Enrollment', enrollmentSchema);
export const Admin = registerModel('Admin', adminSchema);

export default {
  Lesson,
  Course,
  Teacher,
  Student,
  Exam,
  Enrollment,
  Admin
};