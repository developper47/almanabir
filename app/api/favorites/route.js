import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Khutba from '../../../models/Khutba';

// جلب المفضلات للمستخدم
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

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
    await dbConnect();
    const { email, khutbaId } = await req.json();
    
    if (!email || !khutbaId) {
      return NextResponse.json({ success: false, error: 'البيانات ناقصة' }, { status: 400 });
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
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const khutbaId = searchParams.get('khutbaId');
    
    if (!email || !khutbaId) {
      return NextResponse.json({ success: false, error: 'البيانات ناقصة' }, { status: 400 });
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
