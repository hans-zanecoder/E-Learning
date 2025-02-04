import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Lesson from '@/app/models/Lesson';
import Course from '@/app/models/Course';

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { courseId } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the lesson
    const lesson = await Lesson.create({
      title: body.title,
      content: body.content,
      courseId: courseId,
      teacherId: decoded.id,
      dueDate: new Date(body.dueDate)
    });

    // Update the course to include the new lesson ID
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { lessons: lesson._id } },
      { new: true }
    );

    return NextResponse.json(lesson, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 