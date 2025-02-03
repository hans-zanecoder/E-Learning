import { NextResponse } from 'next/server';
import Teacher from '@/app/models/Teacher';
import Student from '@/app/models/Student';
import Admin from '@/app/models/Admin';
import { signJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, email, password, role } = await req.json();

    // Check if user exists in any collection
    const collections = {
      student: Student,
      teacher: Teacher,
      admin: Admin,
    };

    const userExists = await collections[
      role as keyof typeof collections
    ].findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user in appropriate collection
    const Model = collections[role as keyof typeof collections];
    const user = new Model({
      username,
      email,
      password,
      role,
    });

    await user.save();

    // Generate JWT
    const token = signJWT({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
