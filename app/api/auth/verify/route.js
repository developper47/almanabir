import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'رمز التفعيل مفقود' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { verificationToken: token },
      { emailVerified: true, verificationToken: null },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'رمز التفعيل غير صالح أو منتهي الصلاحية' }, { status: 400 });
    }

    // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول مع رسالة نجاح
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host');
    return NextResponse.redirect(`${protocol}://${host}/auth?verified=true`);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
