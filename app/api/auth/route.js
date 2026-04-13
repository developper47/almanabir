import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    
    // منفذ خلفي (Fallback) لضمان الدخول للمدير دائماً
    if (email === 'admin@almanabir.com' && password === 'admin123') {
       return NextResponse.json({ 
         success: true, 
         user: { name: 'المدير العام', email, role: 'admin', emailVerified: true, isActive: true } 
       });
    }

    // التحقق من قاعدة البيانات
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }
    
    if (!user.emailVerified) {
      return NextResponse.json({ success: false, error: 'يرجى تأكيد بريدك الإلكتروني أولاً.' }, { status: 403 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'حسابك معطل حالياً من قبل الإدارة.' }, { status: 403 });
    }
    
    return NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
