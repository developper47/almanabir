import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Khutba from '../../../../models/Khutba';
import { requireAdmin } from '../../../../lib/auth';
import { sanitizeFiles } from '../route';

// جلب خطبة واحدة بواسطة المعرّف وزيادة المشاهدات (متاح للعموم)
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const khutba = await Khutba.findByIdAndUpdate(params.id, { $inc: { views: 1 } }, { new: true });
    if (!khutba) return NextResponse.json({ success: false, error: 'غير موجودة' }, { status: 404 });
    return NextResponse.json({ success: true, data: khutba });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تعديل خطبة موجودة (يتطلب صلاحية المدير العام)
export async function PUT(req, { params }) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const body = await req.json();

    const updates = { ...body };
    if (updates.files) {
      updates.files = sanitizeFiles(updates.files);
    }

    const khutba = await Khutba.findByIdAndUpdate(params.id, updates, { new: true });
    if (!khutba) {
      return NextResponse.json({ success: false, error: 'الخطبة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: khutba });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// حذف خطبة (يتطلب صلاحية المدير العام)
export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

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
