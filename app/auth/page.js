"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@almanabir.com');
  const [password, setPassword] = useState('admin123');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [usersDb, setUsersDb] = useState([]);

  useEffect(() => {
    // التحقق مما إذا كان المستخدم قد تم تفعيل حسابه للتو
    const urlParams = new URL(window.location.href).searchParams;
    if (urlParams.get('verified') === 'true') {
      setSuccess('تم تفعيل بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLoginView) {
      try {
        const res = await fetch('/api/auth', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }) 
        });
        const data = await res.json();
        
        if (data.success) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userName', data.user.name);
          localStorage.setItem('userEmail', data.user.email); // Added to store email for profile actions
          router.push('/admin');
        } else {
          setError(data.error || 'خطأ في المصادقة');
        }
      } catch(err) {
        setError('فشل في الاتصال بالخادم.');
      }
    } else {
      try {
        const res = await fetch('/api/users', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: 'member' }) 
        });
        const data = await res.json();
        
        if (data.success) {
          setSuccess('تم التسجيل بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.');
          setName('');
          setEmail('');
          setPassword('');
          setIsLoginView(true);
        } else {
          setError(data.error || 'البريد الإلكتروني قد يكون مستخدماً.');
        }
      } catch(err) {
        setError('تعذر الاتصال بالخادم لإتمام التسجيل.');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>
          <img src="/logo.png" alt="المنابر" style={{ height: '60px', marginBottom: '1rem' }} />
          <h2>{isLoginView ? 'تسجيل الدخول للمنبر' : 'إنشاء حساب جديد'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLoginView ? 'لإدارة الخطب والمشاركة معنا' : 'انضم إلينا كعضو وشارك خطبك'}
          </p>
        </div>

        <div className="card-body">
          {error && (
            <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '1rem', background: '#e6fffa', color: 'var(--primary-green)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {!isLoginView && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>الاسم الكامل</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none' }} 
                  required={!isLoginView}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none', direction: 'ltr' }} 
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none', direction: 'ltr' }} 
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {isLoginView ? 'دخول' : 'تسجيل العضوية'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isLoginView ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            </span>
            <button 
               onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuccess(''); setEmail(''); setPassword(''); }} 
               style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}
            >
              {isLoginView ? 'سجل كعضو جديد' : 'سجل دخولك من هنا'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
