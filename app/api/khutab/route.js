import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Khutba from '../../../models/Khutba';
import { requireAuth } from '../../../lib/auth';

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// جلب كل الخطب أو تصفيتها (متاح للعموم، محمي ضد هجمات ReDoS)
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const isRare = searchParams.get('isRare');
    const isMasterpiece = searchParams.get('isMasterpiece');
    const isProphetic = searchParams.get('isProphetic');
    
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isRare === 'true') filter.isRare = true;
    if (isMasterpiece === 'true') filter.isMasterpiece = true;
    if (isProphetic === 'true') filter.isProphetic = true;
    
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { content: { $regex: sanitized, $options: 'i' } },
        { preacher: { $regex: sanitized, $options: 'i' } }
      ];
    }
    
    const khutab = await Khutba.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: khutab });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// إضافة خطبة جديدة (يتطلب مستخدم مسجل، الأعضاء العاديون تنشر خطبهم كـ 'معلق')
export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await dbConnect();
    const body = await req.json();
    const { title, preacher, category, content, files, isRare, isMasterpiece, isProphetic } = body;

    if (!title || !preacher || !category) {
      return NextResponse.json(
        { success: false, error: 'عنوان الخطبة، الخطيب، والتصنيف حقول مطلوبة' },
        { status: 400 }
      );
    }

    // إذا كان المستخدم ليس مديراً، يتم فرض حالة "معلق" لمراجعة الإدارة
    const status = auth.user.role === 'admin' ? (body.status || 'منشور') : 'معلق';

    const khutba = await Khutba.create({
      title: String(title).trim(),
      preacher: String(preacher).trim(),
      category: String(category).trim(),
      content: content || '',
      files: files || {},
      status,
      date: body.date || new Date().toLocaleDateString('en-CA'),
      isRare: auth.user.role === 'admin' ? Boolean(isRare) : false,
      isMasterpiece: auth.user.role === 'admin' ? Boolean(isMasterpiece) : false,
      isProphetic: auth.user.role === 'admin' ? Boolean(isProphetic) : false
    });

    return NextResponse.json({ success: true, data: khutba }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
