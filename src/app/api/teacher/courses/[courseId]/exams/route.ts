import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';
import Exam from '@/app/models/Exam';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { courseId } = params;
    const examData = await request.json();

    // Create the exam
    const exam = new Exam({
      title: examData.title,
      description: examData.description,
      courseId: courseId,
      questions: examData.questions,
      totalScore: examData.totalScore,
      dueDate: new Date(examData.dueDate)
    });

    await exam.save();

    // Add exam reference to the course
    await Course.findByIdAndUpdate(courseId, {
      $push: { exams: exam._id }
    });

    return NextResponse.json({
      message: 'Exam created successfully',
      exam: exam
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create exam' },
      { status: 500 }
    );
  }
} 