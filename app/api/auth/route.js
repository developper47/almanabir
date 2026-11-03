import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie, clearAuthCookie, getUserFromRequest } from '../../../lib/auth';

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MS = 15 * 60 * 1000; // 15 minutes

function getClientIdentifier(req, email) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  return `${ip}_${email}`;
}

function checkRateLimit(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  // Expired lockout
  if (now - record.firstAttempt > LOCKOUT_PERIOD_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingMinutes = Math.ceil((LOCKOUT_PERIOD_MS - (now - record.firstAttempt)) / 60000);
    return { allowed: false, remainingMinutes };
  }

  return { allowed: true };
}

function recordFailedAttempt(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now - record.firstAttempt > LOCKOUT_PERIOD_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
}

function resetRateLimit(key) {
  loginAttempts.delete(key);
}

// Dummy hash for constant-time comparison when user is not found
const DUMMY_HASH = '$2a$10$e8T/o1aQvGg8k4cK5Z7fI.X6uM9mP1rE3vT5yU7wI9qA1sD3fG5hJ';

// التحقق من حالة الجلسة الحالية
export async function GET(req) {
  try {
    const userPayload = await getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: userPayload });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// تسجيل الدخول
export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const rateLimitKey = getClientIdentifier(req, normalizedEmail);

    // التحقق من تكرار محاولات تسجيل الدخول الفاشلة
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى المحاولة بعد ${rateLimit.remainingMinutes} دقيقة.`
        },
        { status: 429 }
      );
    }

    // التحقق من وجود المستخدم في قاعدة البيانات
    const user = await User.findOne({ email: normalizedEmail });
    
    // Constant-time execution against user enumeration timing attacks
    const passwordHashToCompare = user ? user.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, passwordHashToCompare);

    if (!user || !isMatch) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }
    
    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'يرجى تأكيد بريدك الإلكتروني أولاً.' },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'حسابك معطل حالياً من قبل الإدارة.' },
        { status: 403 }
      );
    }

    // النجاح: تصفير عداد المحاولات الفاشلة
    resetRateLimit(rateLimitKey);

    // توليد رمز JWT آمن صالح لمدة 24 ساعة
    const token = await signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }, 24 * 3600);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // حفظ الجلسة في ملف تعريف ارتباط (Cookie) آمن HttpOnly
    return setAuthCookie(response, token);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// تسجيل الخروج وإلغاء الجلسة
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  return clearAuthCookie(response);
}
