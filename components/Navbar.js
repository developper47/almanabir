"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      setUser({
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole')
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav style={{ background: 'white', boxShadow: 'var(--shadow-sm)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <img src="/logo.png" alt="شعار المنابر" style={{ height: '50px' }} />
            {/* Removed the text "المنابر" as requested */}
          </a>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontWeight: '600', color: 'var(--primary-blue)' }}>
          <a href="/">الرئيسية</a>
          <a href="/about">من نحن</a>
          <a href="/khutab">الخطب</a>
          <a href="/prayer-times">أوقات الصلاة</a>
          <a href="/contact">اتصل بنا</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'left', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>{user.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.role === 'admin' ? 'مدير' : 'عضو'}</div>
              </div>
              <a href={user.role === 'admin' ? "/admin" : "/profile"} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                لوحة التحكم
              </a>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#e53e3e', borderColor: '#e53e3e' }}>
                خروج
              </button>
            </div>
          ) : (
            <a href="/auth" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>تسجيل الدخول</a>
          )}
        </div>
      </div>
    </nav>
  );
}
