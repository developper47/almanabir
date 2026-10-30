import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie, clearAuthCookie, getUserFromRequest } from '../../../lib/auth';

// التحقق من حالة الجلسة الحالية
export async function GET(req) {
  try {
    const userPayload = await getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: userPayload });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// تسجيل الدخول
export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // التحقق من وجود المستخدم في قاعدة البيانات
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }
    
    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'يرجى تأكيد بريدك الإلكتروني أولاً.' },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'حسابك معطل حالياً من قبل الإدارة.' },
        { status: 403 }
      );
    }

    // توليد رمز JWT آمن
    const token = await signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // حفظ الجلسة في ملف تعريف ارتباط (Cookie) آمن HttpOnly
    return setAuthCookie(response, token);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تسجيل الخروج وإلغاء الجلسة
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  return clearAuthCookie(response);
}
