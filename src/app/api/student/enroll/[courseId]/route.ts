import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';
import Student from '@/app/models/Student';
import Enrollment from '@/app/models/Enrollment';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      courseId: params.courseId,
      studentId: decoded.id,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      courseId: params.courseId,
      studentId: decoded.id,
      status: 'active',
      enrollmentDate: new Date(),
      completedLessons: [],
    });

    await enrollment.save();

    // Add student to course's enrolledStudents
    course.enrolledStudents.push(decoded.id);
    await course.save();

    // Add course to student's enrolledCourses
    await Student.findByIdAndUpdate(decoded.id, {
      $push: { enrolledCourses: params.courseId },
    });

    return NextResponse.json({
      message: 'Successfully enrolled in course',
      enrollment: enrollment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

    // Find and update the course
    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Remove student from course's enrolledStudents
    course.enrolledStudents = course.enrolledStudents.filter(
      (studentId: string) => studentId.toString() !== decoded.id
    );
    await course.save();

    // Remove course from student's enrolledCourses
    await Student.findByIdAndUpdate(decoded.id, {
      $pull: { enrolledCourses: params.courseId }
    });

    // Delete the enrollment record
    await Enrollment.findOneAndDelete({
      courseId: params.courseId,
      studentId: decoded.id
    });

    return NextResponse.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Error in DELETE /api/student/enroll/[courseId]:', error);
    return NextResponse.json(
      { error: 'Failed to unenroll from course' },
      { status: 500 }
    );
  }
}
