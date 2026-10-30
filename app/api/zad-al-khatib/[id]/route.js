import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import ZadAlKhatib from '../../../../models/ZadAlKhatib';
import { requireAdmin } from '../../../../lib/auth';

// جلب موضوع واحد وزيادة المشاهدات (متاح للعموم)
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const topic = await ZadAlKhatib.findById(params.id);
    if (!topic) return NextResponse.json({ success: false, error: 'الموضوع غير موجود' }, { status: 404 });
    
    // Increment views
    topic.views = (topic.views || 0) + 1;
    await topic.save();
    
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تعديل موضوع (يتطلب صلاحية المدير العام)
export async function PUT(req, { params }) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const body = await req.json();
    const { title, content, order } = body;

    const updates = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (content !== undefined) updates.content = String(content).trim();
    if (order !== undefined) updates.order = Number(order);

    const topic = await ZadAlKhatib.findByIdAndUpdate(params.id, updates, { new: true });
    if (!topic) {
      return NextResponse.json({ success: false, error: 'الموضوع غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// حذف موضوع (يتطلب صلاحية المدير العام)
export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const deleted = await ZadAlKhatib.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'الموضوع غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
