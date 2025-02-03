import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import Teacher from '@/app/models/Teacher';
import connectDB from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);

    const ADMIN_ROLE = 'admin';

    if (!user || user.role !== ADMIN_ROLE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await Teacher.find({}, 'username fullName _id');

    return NextResponse.json({
      teachers: teachers.map((teacher) => ({
        _id: teacher._id,
        username: teacher.username,
        fullName: teacher.fullName,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
