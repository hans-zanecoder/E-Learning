import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import Course from '@/app/models/Course';
import connectDB from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find courses where teacherId matches the logged-in teacher's ID
    const courses = await Course.find({ teacherId: decoded.id })
      .populate('enrolledStudents', 'username fullName email')
      .select('title description enrolledStudents lessons')
      .lean();

    // Map the database fields to match the frontend interface
    const mappedCourses = courses.map(course => ({
      _id: course._id,
      name: course.title,
      description: course.description,
      enrolledStudents: course.enrolledStudents || [],
      lessons: course.lessons || []
    }));

    return NextResponse.json({ courses: mappedCourses });
  } catch (error: any) {
    console.error('Error in GET /api/teacher/courses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}