import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import mongoose from 'mongoose';
import { verifyJWT } from '@/app/lib/jwt';
import ExamResult from '../../../../../models/ExamResult';

export async function POST(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { score } = await request.json();
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await verifyJWT(token);

    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Save the exam result
    await ExamResult.create({
      examId: params.examId,
      studentId: decoded.id,
      score,
      submittedAt: new Date(),
    });

    return NextResponse.json({ message: 'Exam submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 