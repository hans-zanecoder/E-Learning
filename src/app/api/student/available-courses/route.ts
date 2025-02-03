import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyJWT } from '@/app/lib/jwt';
import Course from '@/app/models/Course';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all courses where the student is not in enrolledStudents array
    const availableCourses = await Course.find({
      enrolledStudents: { $nin: [decoded.id] }
    })
    .populate('teacherId', 'fullName')
    .lean();

    return NextResponse.json({ 
      courses: availableCourses 
    });

  } catch (error) {
    console.error('Error in GET /api/student/available-courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available courses' },
      { status: 500 }
    );
  }
} 