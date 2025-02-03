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