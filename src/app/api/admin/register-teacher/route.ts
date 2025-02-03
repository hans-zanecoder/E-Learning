import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import Teacher from '@/app/models/Teacher';
import connectDB from '@/app/lib/db';

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader =
      req.headers.get('Authorization') || req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedUser = await verifyJWT(token);
    const ADMIN_ROLE = 'admin';

    if (!decodedUser || decodedUser.role !== ADMIN_ROLE) {
      //will remove this console log later
      console.log('Unauthorized user:', decodedUser); // For debugging
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, email, password, fullName, courses } = await req.json();

    const existingTeacher = await Teacher.findOne({
      $or: [{ email }, { username }],
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher already exists' },
        { status: 400 }
      );
    }

    // Create new teacher
    const newTeacher = new Teacher({
      username,
      email,
      password,
      fullName,
      courses,
      role: 'teacher',
    });

    await newTeacher.save();

    //will remove this console log later
    console.log('New teacher saved:', newTeacher);

    return NextResponse.json({
      message: 'Teacher created successfully',
      user: {
        id: newTeacher._id,
        username: newTeacher.username,
        email: newTeacher.email,
        role: newTeacher.role,
        courses: newTeacher.courses,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
