import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Course from '@/app/models/Course';
import Teacher from '@/app/models/Teacher';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    },
    responseLimit: false
  }
}

// Add GET method for route validation
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  console.log('GET request received', params);
  try {
    await connectDB();
    const course = await Course.findById(params.courseId).populate({
      path: 'teacherId',
      select: 'fullName email username',
      model: 'Teacher'
    });

    if (!course) {
      console.log('Course not found');
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Course found:', course);
    return NextResponse.json(course);
  } catch (error: any) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectDB();

    // Clone the request to avoid consuming it multiple times
    const clonedRequest = request.clone();
    
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { courseId } = params;
    const body = await clonedRequest.json();

    // Get current course before updating
    const currentCourse = await Course.findById(courseId);
    if (!currentCourse) {
      return new NextResponse(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update course with minimal response payload
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title: body.title,
        description: body.description,
        category: body.category,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        teacherId: body.teacherId
      },
      { 
        new: true,
        select: 'title description category startDate endDate teacherId' 
      }
    ).populate({
      path: 'teacherId',
      select: 'fullName email username',
      model: 'Teacher'
    });

    // Handle teacher updates in the background
    if (body.teacherId) {
      Promise.all([
        Teacher.findByIdAndUpdate(body.teacherId, {
          $addToSet: { courses: courseId }
        }),
        currentCourse.teacherId && Teacher.findByIdAndUpdate(currentCourse.teacherId, {
          $pull: { courses: courseId }
        })
      ]).catch(console.error);
    }

    return new NextResponse(JSON.stringify(updatedCourse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('PUT Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
