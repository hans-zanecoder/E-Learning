import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';
import Exam from '@/app/models/Exam';

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; examId: string } }
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

    const { courseId, examId } = params;

    // Delete the exam
    await Exam.findByIdAndDelete(examId);

    // Remove exam reference from the course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { exams: examId }
    });

    return NextResponse.json({
      message: 'Exam deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete exam' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string; examId: string } }
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { examId } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.questions || !body.totalScore || !body.dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        title: body.title,
        description: body.description,
        questions: body.questions,
        totalScore: body.totalScore,
        dueDate: new Date(body.dueDate)
      },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExam);
  } catch (error: any) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 