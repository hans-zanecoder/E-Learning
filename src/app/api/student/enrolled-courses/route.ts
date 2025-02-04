import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import { Course, Teacher, Enrollment, Exam } from '@/app/models';
import Lesson from '@/app/models/Lesson';
import mongoose from 'mongoose';

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