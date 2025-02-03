import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import Course from '@/app/models/Course';
import connectDB from '@/app/lib/db';
import Teacher from '@/app/models/Teacher';

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

    // Find all courses and populate the teacherId field
    const courses = await Course.find()
      .populate({
        path: 'teacherId',
        select: 'fullName email username',
        model: 'Teacher'
      })
      .exec();

    return NextResponse.json({ courses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Named export for POST method
export async function POST(request: Request) {
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

    const { title, description, category, startDate, endDate, teacherId } =
      await request.json();

    // Create the course
    const course = new Course({
      title,
      description,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      teacherId: teacherId || null,
      enrolledStudents: [],
      lessons: [],
      assignments: [],
      quizzes: [],
      exams: [],
    });

    await course.save();

    // If a teacher is assigned, update their courses array
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
        $addToSet: { courses: course._id },
      });
    }

    // Fetch the populated course
    const populatedCourse = await Course.findById(course._id).populate({
      path: 'teacherId',
      select: 'fullName email username',
      model: 'Teacher',
    });

    return NextResponse.json({
      message: 'Course created successfully',
      course: populatedCourse,
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
