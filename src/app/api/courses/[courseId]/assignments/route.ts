import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import Assignment from '@/app/models/Assignment';

export async function GET(
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

    const assignments = await Assignment.find({ courseId: params.courseId });
    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 