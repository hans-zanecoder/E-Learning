import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/jwt';
import Admin from '@/app/models/Admin';
import connectDB from '@/app/lib/db';

export async function POST(req: Request) {
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

    const { username, email, password, fullName } = await req.json();

    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    // Create new admin
    const newAdmin = new Admin({
      username,
      email,
      password,
      fullName,
      role: 'admin',
    });

    await newAdmin.save();

    //will remove this console log later
    console.log('New admin saved:', newAdmin);

    return NextResponse.json({
      message: 'Admin created successfully',
      user: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
