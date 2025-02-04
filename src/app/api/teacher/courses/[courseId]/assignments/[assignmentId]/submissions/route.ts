import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import Assignment from '@/app/models/Assignment';

interface AssignmentDocument {
  _id: string;
  submissions?: Array<{
    studentId: string;
    fileUrl?: string;
    submissionText?: string;
    submittedAt: Date;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
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

    const assignment = await Assignment.findById(params.assignmentId)
      .select('submissions')
      .lean() as AssignmentDocument;

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ submissions: assignment.submissions || [] });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 