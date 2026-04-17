"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav style={{ background: 'white', boxShadow: 'var(--shadow-sm)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container flex-between" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <img src="/logo.png" alt="شعار المنابر" style={{ height: '50px' }} />
          </a>
        </div>
        
        {/* Mobile Toggle Button */}
        <button 
          className="mobile-show" 
          onClick={toggleMenu}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--primary-blue)' }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</a>
          <a href="/about" onClick={() => setIsMenuOpen(false)}>من نحن</a>
          <a href="/successful-preacher" onClick={() => setIsMenuOpen(false)}>الخطيب الناجح</a>
          <a href="/khutab" onClick={() => setIsMenuOpen(false)}>الخطب</a>
          {user && <a href="/favorites" onClick={() => setIsMenuOpen(false)}>مكتبتي الخاصة</a>}
          <a href="/prayer-times" onClick={() => setIsMenuOpen(false)}>أوقات الصلاة</a>
          <a href="/contact" onClick={() => setIsMenuOpen(false)}>اتصل بنا</a>
          
          <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <div className="user-profile" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'left', fontSize: '0.9rem' }} className="mobile-hide">
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
              <a href="/auth" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</a>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}
