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
    if (typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await verifyJWT(token);

    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const result = await ExamResult.create({
      examId: params.examId,
      studentId: decoded.id,
      score,
      submittedAt: new Date(),
    });

    return NextResponse.json({ message: 'Exam submitted successfully', score });
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 