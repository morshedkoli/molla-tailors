import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
    } catch (dbErr: any) {
      console.error('MongoDB Connection Error:', dbErr);
      if (dbErr.message?.includes('bad auth') || dbErr.code === 8000) {
        return NextResponse.json(
          {
            error: 'MongoDB Authentication Failed (bad auth). Please check your database username/password in .env.local',
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error: `Database connection error: ${dbErr.message || 'Could not connect to MongoDB'}. Ensure MongoDB is running or check MONGODB_URI in .env.local`,
        },
        { status: 500 }
      );
    }

    // Auto-seed default admin if no admin exists in DB
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Master Tailor Admin',
      });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: admin._id.toString(),
      username: admin.username,
      name: admin.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
