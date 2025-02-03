import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import connectDB from '@/app/lib/db';
import Teacher from '@/app/models/Teacher';
import Student from '@/app/models/Student';
import Admin from '@/app/models/Admin';

export async function GET(request: Request) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users from all collections
    const [teachers, students, admins] = await Promise.all([
      Teacher.find({}, '-password'),
      Student.find({}, '-password'),
      Admin.find({}, '-password'),
    ]);

    // Combine and format users
    const users = [
      ...teachers.map(user => ({ ...user.toObject(), isActive: true })),
      ...students.map(user => ({ ...user.toObject(), isActive: true })),
      ...admins.map(user => ({ ...user.toObject(), isActive: true })),
    ];

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string' || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, updates } = await request.json();

    // Find user in appropriate collection based on role
    const collections = {
      student: Student,
      teacher: Teacher,
      admin: Admin,
    };

    let updatedUser = null;
    for (const Collection of Object.values(collections)) {
      updatedUser = await Collection.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, select: '-password' }
      );
      if (updatedUser) break;
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}