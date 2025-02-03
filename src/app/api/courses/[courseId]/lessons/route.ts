import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import { ObjectId } from 'mongodb';
import Lesson from '@/app/models/Lesson';
import Course from '@/app/models/Course';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // First check if the student is enrolled in the course
    const course = await Course.findById(params.courseId)
      .populate({
        path: 'lessons',
        model: Lesson,
        select: '_id title content dueDate studentProgress createdAt'
      });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const lessonsWithProgress = course.lessons.map((lesson: any) => ({
      _id: lesson._id,
      title: lesson.title,
      content: lesson.content,
      dueDate: lesson.dueDate,
      courseId: params.courseId,
      completed: lesson.studentProgress?.some(
        (progress: { studentId: string; completed: boolean }) => 
          progress.studentId === user.id && progress.completed
      ) || false,
      createdAt: lesson.createdAt
    }));

    

    console.log('Lessons with progress:', lessonsWithProgress);
    return NextResponse.json({ lessons: lessonsWithProgress });
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
} 