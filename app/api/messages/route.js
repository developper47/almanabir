import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Message from '../../../models/Message';
import { requireAdmin } from '../../../lib/auth';

// جلب كل الرسائل (يتطلب صلاحية المدير العام)
export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const messages = await Message.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إضافة رسالة جديدة من نموذج التواصل (متاح للعموم مع التحقق من صحة المدخلات)
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'جميع حقول الرسالة مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة البريد الإلكتروني والحد من طول النصوص لتفادي الإغراق
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' },
        { status: 400 }
      );
    }

    if (String(message).length > 5000) {
      return NextResponse.json(
        { success: false, error: 'الرسالة تتجاوز الحد الأقصى المسموح به' },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      name: String(name).slice(0, 100).trim(),
      email: String(email).slice(0, 100).toLowerCase().trim(),
      subject: String(subject).slice(0, 200).trim(),
      message: String(message).trim(),
      status: 'unread'
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
