import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import ZadAlKhatib from '../../../models/ZadAlKhatib';

export async function GET(req) {
  try {
    await dbConnect();
    const topics = await ZadAlKhatib.find({}).sort({ order: 1 });
    return NextResponse.json({ success: true, data: topics });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const topic = await ZadAlKhatib.create(body);
    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
