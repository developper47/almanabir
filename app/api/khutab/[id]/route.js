import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Khutba from '../../../../models/Khutba';

// جلب خطبة واحدة بواسطة المعرّف
export async function GET(req, { params }) {
  try {
    await dbConnect();
    // جلب الخطبة وزيادة عدد المشاهدات تلقائياً
    const khutba = await Khutba.findByIdAndUpdate(params.id, { $inc: { views: 1 } }, { new: true });
    if (!khutba) return NextResponse.json({ success: false, error: 'غير موجودة' }, { status: 404 });
    return NextResponse.json({ success: true, data: khutba });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تعديل خطبة موجودة
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    // البحث بواسطة الـ id المشفر (ObjectId) أو المعرّف الخاص
    const khutba = await Khutba.findByIdAndUpdate(params.id, body, { new: true });
    if (!khutba) {
      return NextResponse.json({ success: false, error: 'الخطبة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: khutba });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// حذف خطبة
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const deletedKhutba = await Khutba.findByIdAndDelete(params.id);
    if (!deletedKhutba) {
       return NextResponse.json({ success: false, error: 'الخطبة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
