import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await dbConnect();
  const slug = (await params).slug.join('/');

  if (slug === 'change-password') {
    try {
      const { verifyAuth } = await import('@/lib/auth');
      const auth = verifyAuth(req);
      if (!auth || !auth.user || !auth.user.userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const { currentPassword, newPassword } = await req.json();

      const user = await (User as any).findById(auth.user.userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, (user as any).password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  if (slug === 'register') {
    try {
      const body = await req.json();
      const { name, email, password, role } = body;

      const existingUser = await (User as any).findOne({ email });
      if (existingUser) {
        return NextResponse.json({ message: 'User already exists' }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        name, email, password: hashedPassword, role: role || 'user'
      });
      await user.save();

      return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  if (slug === 'login') {
    try {
      const { email, password } = await req.json();

      let settings = await (Settings as any).findOne();
      if (!settings) {
        settings = { adminUsername: 'admin', adminPassword: 'admin' };
      }
      const validAdminUser = settings.adminUsername || 'admin';
      const validAdminPass = settings.adminPassword || 'admin';

      if (email === validAdminUser && password === validAdminPass) {
        const token = jwt.sign(
          { userId: 'db-admin', role: 'admin' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );
        return NextResponse.json({ token, user: { id: 'admin', name: 'Admin', email: settings.adminUsername } });
      }

      const user = await (User as any).findOne({ email });
      if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(password, (user as any).password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
      }
      const token = jwt.sign(
        { userId: user._id, role: (user as any).role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Route not found' }, { status: 404 });
}
