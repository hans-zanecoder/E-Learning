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
    
    console.log('Received assignmentId:', params.assignmentId);

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { fileUrl, submissionText, submissionType } = await request.json();

    // First check if assignment exists
    const existingAssignment = await Assignment.findById(params.assignmentId);
    console.log('Found assignment:', existingAssignment);

    if (!existingAssignment) {
      console.error('Assignment not found with ID:', params.assignmentId);
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Create submission
    const assignment = await Assignment.findByIdAndUpdate(
      params.assignmentId,
      {
        $push: {
          submissions: {
            studentId: decoded.id,
            fileUrl,
            submissionText,
            submissionType,
            submittedAt: new Date()
          }
        }
      },
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Assignment submitted successfully', 
      assignment 
    });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 