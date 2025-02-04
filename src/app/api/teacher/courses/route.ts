import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';
import Lesson from '@/app/models/Lesson';
import Exam from '@/app/models/Exam';

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

    const courses = await Course.find({ teacherId: decoded.id })
      .populate({
        path: 'lessons',
        model: Lesson,
        select: 'title content dueDate studentProgress'
      })
      .populate('enrolledStudents', 'username fullName email')
      .populate({
        path: 'exams',
        model: Exam,
        select: 'title description dueDate totalScore'
      })
      .select('title description enrolledStudents lessons exams')
      .lean();

    const mappedCourses = courses.map(course => ({
      _id: course._id,
      name: course.title,
      description: course.description,
      enrolledStudents: course.enrolledStudents || [],
      lessons: (course.lessons || []).map((lesson: any) => ({
        ...lesson,
        courseName: course.title
      })),
      exams: course.exams || []
    }));

    return NextResponse.json({ courses: mappedCourses });
  } catch (error: any) {
    console.error('Error in GET /api/teacher/courses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}