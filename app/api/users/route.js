import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

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

    const user = await User.create(body);
    // إخفاء الرقم السري قبل الإرجاع
    user.password = undefined;
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تفعيل وتحديث صلاحيات المستخدم
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    // البحث بواسطة البريد الإلكتروني وتنشيط الحساب أو تغيير الصلاحية
    const user = await User.findOneAndUpdate({ email: body.email }, body, { new: true }).select('-password');
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
