import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Khutba from '../../../models/Khutba';
import { requireAuth } from '../../../lib/auth';

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return '';
  } catch {
    return '';
  }
}

export function sanitizeFiles(files) {
  if (!files || typeof files !== 'object') return {};
  const clean = {};
  if (files.youtube) {
    const safe = sanitizeUrl(files.youtube);
    if (safe) clean.youtube = safe;
  }
  if (files.audio) {
    const safe = sanitizeUrl(files.audio);
    if (safe) clean.audio = safe;
  }
  if (files.video) {
    const safe = sanitizeUrl(files.video);
    if (safe) clean.video = safe;
  }
  if (files.pdf) {
    const safe = sanitizeUrl(files.pdf);
    if (safe) clean.pdf = safe;
  }
  if (files.word) {
    const safe = sanitizeUrl(files.word);
    if (safe) clean.word = safe;
  }
  return clean;
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

// إضافة خطبة جديدة (يتطلب مستخدم مسجل، مع تعقيم الروابط لمنع هجمات XSS)
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

    // تعقيم روابط المرفقات لضمان عدم وجود روابط ضارة javascript:
    const safeFiles = sanitizeFiles(files);

    const khutba = await Khutba.create({
      title: String(title).trim(),
      preacher: String(preacher).trim(),
      category: String(category).trim(),
      content: content ? String(content) : '',
      files: safeFiles,
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
