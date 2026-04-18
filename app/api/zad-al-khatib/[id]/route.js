import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import ZadAlKhatib from '../../../../models/ZadAlKhatib';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const topic = await ZadAlKhatib.findById(params.id);
    if (!topic) return NextResponse.json({ success: false, error: 'Topic not found' }, { status: 404 });
    
    // Increment views
    topic.views += 1;
    await topic.save();
    
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    const topic = await ZadAlKhatib.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    await ZadAlKhatib.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
