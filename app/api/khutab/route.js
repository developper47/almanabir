import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Khutba from '../../../models/Khutba';

// جلب كل الخطب أو تصفيتها
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { preacher: { $regex: search, $options: 'i' } }
      ];
    }
    
    const khutab = await Khutba.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: khutab });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إضافة خطبة جديدة
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const khutba = await Khutba.create(body);
    return NextResponse.json({ success: true, data: khutba }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
