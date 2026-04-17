import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Message from '../../../models/Message';

// جلب كل الرسائل
export async function GET(req) {
  try {
    await dbConnect();
    const messages = await Message.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إضافة رسالة جديدة
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const message = await Message.create(body);
    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
