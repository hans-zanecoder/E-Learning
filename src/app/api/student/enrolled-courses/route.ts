import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import { Course, Teacher, Enrollment } from '@/app/models';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define Lesson Schema if not already registered
const LessonSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  title: String,
  content: String,
  dueDate: Date,
  studentProgress: [{
    studentId: { type: String, ref: 'Student' },
    completed: Boolean
  }],
  createdAt: Date
}, {
  _id: false
});

// Define Exam Schema
const ExamSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  title: String,
  description: String,
  courseId: { type: String, ref: 'Course' },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  totalScore: Number,
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false
});

// Register models only if they haven't been registered
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);

interface LessonType {
  _id: string;
  title: string;
  content: string;
  dueDate: Date;
  studentProgress?: Array<{
    studentId: string;
    completed: boolean;
  }>;
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({
      studentId: decoded.id,
      status: 'active'
    }).lean();

    const courseIds = enrollments.map(enrollment => enrollment.courseId);

    // Find courses using string IDs
    const enrolledCourses = await Course.find({
      _id: { $in: courseIds }
    })
    .populate({
      path: 'teacherId',
      select: 'fullName email username'
    })
    .populate({
      path: 'lessons',
      model: 'Lesson'
    })
    .populate({
      path: 'exams',
      model: 'Exam'
    })
    .lean();

    const coursesWithProgress = enrolledCourses.map(course => ({
      ...course,
      lessons: course.lessons?.map((lesson: LessonType) => ({
        ...lesson,
        completed: lesson.studentProgress?.some(
          progress => 
            progress.studentId === decoded.id && 
            progress.completed
        ) || false
      })) || [],
      exams: course.exams || []
    }));

    return NextResponse.json({ courses: coursesWithProgress });

  } catch (error: any) {
    console.error('Error in enrolled-courses route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}