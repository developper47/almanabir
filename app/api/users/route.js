import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// جلب جميع المستخديمن (للوحة الإدارة)
export async function GET(req) {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تسجيل مستخدم جديد
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const verificationToken = uuidv4();

    const user = await User.create({
      ...body,
      password: hashedPassword,
      emailVerified: false,
      isActive: true,
      verificationToken
    });

    // إرسال بريد التفعيل باستخدام Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = req.headers.get('host');
        const verifyUrl = `${protocol}://${host}/api/auth/verify?token=${verificationToken}`;

        await resend.emails.send({
          from: 'almanabir@resend.dev', // ستحتاج لتغيير هذا لنطاقك الخاص لاحقاً
          to: user.email,
          subject: 'تأكيد حسابك في منصة المنابر',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; padding: 20px;">
              <h2>مرحباً ${user.name}</h2>
              <p>شكراً لتسجيلك في منصة المنابر. يرجى الضغط على الرابط أدناه لتفعيل حسابك:</p>
              <a href="${verifyUrl}" style="background-color: #2f855a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تفعيل الحساب</a>
              <p>إذا لم تكن قد سجلت في المنصة، يرجى تجاهل هذا البريد.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    // إخفاء الرقم السري قبل الإرجاع
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تحديث بيانات المستخدم (تفعيل/تعطيل، تغيير دور)
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // منع تعطيل المدير العام
    if (body.email === 'admin@almanabir.com' && body.isActive === false) {
      return NextResponse.json({ success: false, error: 'لا يمكن تعطيل حساب المدير العام' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate({ email: body.email }, body, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// حذف مستخدم
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (email === 'admin@almanabir.com') {
      return NextResponse.json({ success: false, error: 'لا يمكن حذف المدير العام' }, { status: 400 });
    }
    await User.findOneAndDelete({ email });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
