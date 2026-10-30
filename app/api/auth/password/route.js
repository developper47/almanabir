import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../../../../lib/auth';

export async function PUT(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'جميع حقول كلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // منع تعديل كلمة مرور مستخدم آخر إلا إذا كان مديراً
    if (auth.user.email !== normalizedEmail && auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بتعديل هذا الحساب' },
        { status: 403 }
      );
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التحقق من كلمة المرور الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
