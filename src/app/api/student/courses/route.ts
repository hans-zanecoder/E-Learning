import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await Course.find({ isActive: true })
      .populate('teacherId', 'fullName email username')
      .select('title description teacherId lessons startDate isActive')
      .lean();

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    );
  }
} 