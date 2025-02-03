import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import Course from '@/app/models/Course';
import Enrollment from '@/app/models/Enrollment';
import mongoose from 'mongoose';

// Define Lesson Schema if not already registered
const LessonSchema = new mongoose.Schema({
  title: String,
  content: String,
  dueDate: Date,
  studentProgress: [{
    studentId: mongoose.Schema.Types.ObjectId,
    completed: Boolean
  }],
  createdAt: Date
});

// Define Exam Schema
const ExamSchema = new mongoose.Schema({
  title: String,
  description: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  totalScore: Number,
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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

    // First get the student's enrollments
    const enrollments = await Enrollment.find({
      studentId: decoded.id,
      status: 'active'
    }).lean();

    // Get the course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.courseId);

    // Find all courses that the student is enrolled in
    const enrolledCourses = await Course.find({
      _id: { $in: courseIds }
    })
    .populate({
      path: 'teacherId',
      select: 'fullName email username',
      model: 'Teacher'
    })
    .populate({
      path: 'lessons',
      select: 'title content dueDate studentProgress createdAt description',
      model: 'Lesson'
    })
    .populate({
      path: 'exams',
      model: 'Exam'
    })
    .lean();

    // Transform the courses data to include completion status
    const coursesWithProgress = enrolledCourses.map(course => ({
      ...course,
      lessons: course.lessons?.map((lesson: LessonType) => ({
        ...lesson,
        completed: lesson.studentProgress?.some(
          progress => 
            progress.studentId.toString() === decoded.id && 
            progress.completed
        ) || false
      })) || [],
      exams: course.exams || [] // Ensure exams array exists
    }));

    return NextResponse.json({ 
      courses: coursesWithProgress 
    });

  } catch (error: any) {
    console.error('Error in enrolled-courses route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}