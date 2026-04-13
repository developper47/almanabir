"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/auth');
    } else {
      setUser({
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
      });
    }
  }, [router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' });
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تغيير كلمة المرور' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>
          <h2>الملف الشخصي</h2>
          <p style={{ color: 'var(--text-muted)' }}>إدارة بياناتك وكلمة المرور</p>
        </div>

        <div className="card-body">
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: '0.5rem' }}><strong>الاسم:</strong> {user.name}</div>
            <div style={{ marginBottom: '0.5rem' }}><strong>البريد الإلكتروني:</strong> {user.email}</div>
            <div><strong>الصلاحية:</strong> {user.role === 'admin' ? 'مدير' : 'عضو'}</div>
          </div>

          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>تغيير كلمة المرور</h3>
          
          {message.text && (
            <div style={{ 
              padding: '1rem', 
              background: message.type === 'success' ? '#e6fffa' : '#ffebee', 
              color: message.type === 'success' ? 'var(--primary-green)' : '#c62828', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem', 
              textAlign: 'center', 
              fontSize: '0.9rem' 
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>كلمة المرور الحالية</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>كلمة المرور الجديدة</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>تأكيد كلمة المرور الجديدة</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none' }}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
