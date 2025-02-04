import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import { Course } from '@/app/models';
import Assignment from '@/app/models/Assignment';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectDB();
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, description, dueDate, fileRequired } = await request.json();

    const assignment = await Assignment.create({
      title,
      description,
      courseId: params.courseId,
      dueDate,
      fileRequired
    });

    // Add type assertion to Course model
    const CourseModel = Course as mongoose.Model<any>;
    await CourseModel.findByIdAndUpdate(params.courseId, {
      $push: { assignments: assignment._id }
    });

    return NextResponse.json({ assignment });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 