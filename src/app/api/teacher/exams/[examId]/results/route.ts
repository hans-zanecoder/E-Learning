import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ExamResult from '@/app/models/ExamResult';
import { verifyJWT } from '@/app/lib/jwt';

export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
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

    const results = await ExamResult.find({ examId: params.examId })
      .select('studentId score submittedAt')
      .lean();

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 