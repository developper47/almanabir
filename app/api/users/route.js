import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { requireAdmin } from '../../../lib/auth';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// جلب جميع المستخدمين (يتطلب صلاحية المدير العام)
export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تسجيل مستخدم جديد (متاح للعموم، محمي ضد التعيين الجماعي Mass Assignment)
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password } = body;

    // التحقق من صحة المدخلات
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).toLowerCase().trim();

    // التحقق من طول وقوة كلمة المرور
    if (String(password).length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب ألا تقل عن 8 أحرف' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    // الحماية من رفع الصلاحيات: الدور محدد إجبارياً كعضو 'member' ولا يمكن تجاوزه
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'member',
      emailVerified: false,
      isActive: true,
      verificationToken
    });

    // إرسال بريد التفعيل باستخدام Resend
    if (process.env.RESEND_API_KEY && resend) {
      try {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = req.headers.get('host');
        const verifyUrl = `${protocol}://${host}/api/auth/verify?token=${verificationToken}`;

        await resend.emails.send({
          from: 'almanabir@resend.dev',
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

    // إخفاء البيانات الحساسة قبل الإرجاع
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    
    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تحديث بيانات المستخدم (تفعيل/تعطيل، تغيير دور - يتطلب صلاحية المدير)
export async function PUT(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const body = await req.json();
    const { email, role, isActive } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // منع تعطيل أو تعديل المدير العام الرئيسي
    if (normalizedEmail === 'admin@almanabir.com' && isActive === false) {
      return NextResponse.json({ success: false, error: 'لا يمكن تعطيل حساب المدير العام' }, { status: 400 });
    }

    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (role && ['admin', 'member', 'visitor'].includes(role)) updates.role = role;

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// حذف مستخدم (يتطلب صلاحية المدير العام)
export async function DELETE(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (normalizedEmail === 'admin@almanabir.com') {
      return NextResponse.json({ success: false, error: 'لا يمكن حذف المدير العام' }, { status: 400 });
    }

    const deleted = await User.findOneAndDelete({ email: normalizedEmail });
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
