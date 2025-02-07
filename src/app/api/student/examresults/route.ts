import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import ExamResult from '@/app/models/ExamResult';
import connectDB from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const examResults = await ExamResult.find({
      studentId: user.id
    }).lean();

    return NextResponse.json({ results: examResults });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam results' }, 
      { status: 500 }
    );
  }
} 