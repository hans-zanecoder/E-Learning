import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';
import Teacher from '@/app/models/Teacher';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { teacherId } = await request.json();

    // Find the course
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // If there was a previous teacher, remove the course from their courses array
    if (course.teacherId) {
      await Teacher.findByIdAndUpdate(course.teacherId, {
        $pull: { courses: course._id },
      });
    }

    // If no new teacher is assigned (teacherId is null or empty), remove the teacherId
    const updateData = teacherId ? { teacherId } : { $unset: { teacherId: 1 } };

    // Update the course with the new teacher (or remove teacher)
    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('teacherId', 'fullName email');

    // If a new teacher is assigned, add the course to their courses array
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
        $addToSet: { courses: course._id },
      });
    }

    return NextResponse.json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
