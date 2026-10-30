import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Message from '../../../../models/Message';
import { requireAdmin } from '../../../../lib/auth';

// حذف رسالة (يتطلب صلاحية المدير العام)
export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const deletedMessage = await Message.findByIdAndDelete(params.id);
    if (!deletedMessage) {
      return NextResponse.json({ success: false, error: 'الرسالة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تحديث حالة الرسالة: مقروءة/غير مقروءة (يتطلب صلاحية المدير العام)
export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const body = await req.json();

    if (!['read', 'unread'].includes(body.status)) {
      return NextResponse.json({ success: false, error: 'حالة غير صالحة' }, { status: 400 });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      params.id,
      { status: body.status },
      { new: true }
    );
    if (!updatedMessage) {
      return NextResponse.json({ success: false, error: 'الرسالة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
