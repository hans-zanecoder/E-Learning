import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Student from '@/app/models/Student';
import Teacher from '@/app/models/Teacher';
import Admin from '@/app/models/Admin';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // Check all collections for the user
    const collections = [Student, Teacher, Admin];
    let user = null;

    for (const Collection of collections) {
      const foundUser = await Collection.findOne({ email });
      if (foundUser) {
        user = foundUser;
        break;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
