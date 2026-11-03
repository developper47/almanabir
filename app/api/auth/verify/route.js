import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'رمز التفعيل مفقود' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { verificationToken: token.trim() },
      { emailVerified: true, verificationToken: null },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'رمز التفعيل غير صالح أو منتهي الصلاحية' }, { status: 400 });
    }

    // إعادة توجيه المستخدم بأمان إلى صفحة تسجيل الدخول دون الاعتماد على ترويسة Host
    const redirectUrl = new URL('/auth?verified=true', req.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
