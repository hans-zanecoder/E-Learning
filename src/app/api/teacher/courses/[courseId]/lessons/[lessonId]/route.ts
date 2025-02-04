import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Lesson from '@/app/models/Lesson';

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
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

    const { lessonId } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        title: body.title,
        content: body.content,
        dueDate: new Date(body.dueDate)
      },
      { new: true }
    );

    if (!updatedLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLesson);
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 