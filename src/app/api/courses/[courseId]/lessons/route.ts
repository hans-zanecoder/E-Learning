import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import { Course, Lesson } from '@/app/models';
import { Model } from 'mongoose';

const CourseModel = Course as Model<any>;

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
    await connectDB();
    const course = await CourseModel.findOne({ _id: params.courseId })
      .populate({
        path: 'lessons',
        model: Lesson,
        select: '_id title content dueDate studentProgress createdAt'
      });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ lessons: course.lessons });
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 