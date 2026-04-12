import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    
    // منفذ خلفي (Fallback) لضمان الدخول للمدير دائماً
    if (email === 'admin@almanabir.com' && password === 'admin123') {
       return NextResponse.json({ 
         success: true, 
         user: { name: 'المدير العام', email, role: 'admin', verified: true } 
       });
    }

    // التحقق من قاعدة البيانات
    const user = await User.findOne({ email, password });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }
    
    if (!user.verified) {
      return NextResponse.json({ success: false, error: 'حسابك قيد المراجعة. يرجى انتظار تفعيل الإدارة.' }, { status: 403 });
    }
    
    return NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
