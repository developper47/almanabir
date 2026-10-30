import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import ZadAlKhatib from '../../../models/ZadAlKhatib';
import { requireAdmin } from '../../../lib/auth';

// جلب كل مواضيع زاد الخطيب (متاح للعموم)
export async function GET(req) {
  try {
    await dbConnect();
    const topics = await ZadAlKhatib.find({}).sort({ order: 1 });
    return NextResponse.json({ success: true, data: topics });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إضافة موضوع جديد (يتطلب صلاحية المدير العام)
export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const body = await req.json();
    const { title, content, order } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'عنوان الموضوع والمحتوى مطلوبان' },
        { status: 400 }
      );
    }

    const topic = await ZadAlKhatib.create({
      title: String(title).trim(),
      content: String(content).trim(),
      order: Number(order) || 0
    });

    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
