import connectDB from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import Teacher from '@/app/models/Teacher';
import Student from '@/app/models/Student';
import Course from '@/app/models/Course';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get counts from all collections
    const teachersCount = await Teacher.countDocuments();
    const activeStudentsCount = await Student.countDocuments();
    const coursesCount = await Course.countDocuments();

    // Calculate percentage changes (mock data for now)
    const stats = {
      teachersCount,
      activeStudentsCount,
      coursesCount,
      teacherGrowth: 12, // Percentage growth from last month
      studentGrowth: 15,
      courseGrowth: 8,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
