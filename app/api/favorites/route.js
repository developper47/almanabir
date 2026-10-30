import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { requireAuth } from '../../../lib/auth';

// جلب المفضلات للمستخدم (محمي بـ JWT، يستخرج البريد مباشرة من الجلسة الآمنة)
export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    // نستخدم البريد المؤكد من الجلسة لمنع BOLA / IDOR
    const email = auth.user.email;

    const user = await User.findOne({ email }).populate('favorites');
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user.favorites });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إضافة خطبة للمفضلة
export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const { khutbaId } = await req.json();
    const email = auth.user.email;
    
    if (!khutbaId) {
      return NextResponse.json({ success: false, error: 'معرّف الخطبة مطلوب' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { favorites: khutbaId } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user.favorites });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إزالة خطبة من المفضلة
export async function DELETE(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const khutbaId = searchParams.get('khutbaId');
    const email = auth.user.email;
    
    if (!khutbaId) {
      return NextResponse.json({ success: false, error: 'معرّف الخطبة مطلوب' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { favorites: khutbaId } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user.favorites });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
