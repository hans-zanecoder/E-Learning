import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import Assignment from '@/app/models/Assignment';

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
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

    const { fileUrl, submissionText } = await request.json();

    const assignment = await Assignment.findByIdAndUpdate(
      params.assignmentId,
      {
        $push: {
          submissions: {
            studentId: decoded.id,
            fileUrl,
            submissionText,
            submittedAt: new Date()
          }
        }
      },
      { new: true }
    );

    return NextResponse.json({ message: 'Assignment submitted successfully', assignment });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 