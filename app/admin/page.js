"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: '', role: '' });
  const [recentKhutab, setRecentKhutab] = useState([]);
  const [stats, setStats] = useState({ published: 0, pending: 0, categories: 0 });

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/auth');
    } else {
      setUser({
        name: localStorage.getItem('userName') || 'مستخدم',
        role: localStorage.getItem('userRole') || 'member'
      });
      
      // Fetch stats and recent sermons
      const fetchData = async () => {
        try {
          const res = await fetch('/api/khutab');
          const data = await res.json();
          if (data.success) {
            const khutab = data.data;
            setRecentKhutab(khutab.slice(0, 5));
            setStats({
              published: khutab.filter(k => k.status === 'منشور').length,
              pending: khutab.filter(k => k.status === 'معلق').length,
              categories: [...new Set(khutab.map(k => k.category))].length
            });
          }
        } catch (err) {
          console.error("Dashboard fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [router]);

  const roleName = user.role === 'admin' ? 'مدير عام' : user.role === 'visitor' ? 'دارس' : 'عضو';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحقق من الصلاحيات...</div>;
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container">
        <div className="flex-between stack-mobile" style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>لوحة الإدارة</h1>
            <p style={{ color: 'var(--text-muted)' }}>مرحباً بك، {user.name} <span className="badge">{roleName}</span></p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', width: 'auto' }}>
            تسجيل الخروج
          </button>
        </div>

        <div className="grid-3">
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--primary-blue)', fontSize: '2.5rem' }}>{stats.published}</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>الخطب المنشورة</p>
              <a href="/admin/khutab" className="btn btn-primary" style={{ display: 'block', width: '100%', marginTop: '1rem' }}>إدارة الخطب</a>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#e53e3e', fontSize: '2.5rem' }}>{stats.pending}</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>خطب بانتظار الموافقة</p>
              <a href="/admin/khutab" className="btn btn-outline" style={{ display: 'block', width: '100%', marginTop: '1rem' }}>مراجعة الخطب</a>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
               <h3 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem' }}>{stats.categories}</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>التصنيفات الحالية</p>
              <a href="/admin/categories" className="btn btn-gold" style={{ display: 'block', width: '100%', marginTop: '1rem' }}>إدارة التصنيفات</a>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
               <h3 style={{ color: 'var(--primary-green)', fontSize: '2.5rem' }}>📚</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>إدارة زاد الخطيب</p>
              <a href="/admin/zad-al-khatib" className="btn btn-primary" style={{ display: 'block', width: '100%', marginTop: '1rem' }}>تعديل النصائح والمواد</a>
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                 <h3 style={{ color: 'var(--primary-blue)', fontSize: '2.5rem' }}>👥</h3>
                <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>إدارة الأعضاء</p>
                <a href="/admin/users" className="btn btn-outline" style={{ display: 'block', width: '100%', marginTop: '1rem' }}>طلبات التسجيل</a>
              </div>
            </div>
          )}

          {user.role === 'admin' && (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                 <h3 style={{ color: 'var(--primary-green)', fontSize: '2.5rem' }}>✉️</h3>
                <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>صندوق الوارد</p>
                <a href="/admin/messages" className="btn btn-primary" style={{ display: 'block', width: '100%', marginTop: '1rem' }}>الرسائل والمرسلات</a>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '3rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
            <h3 style={{ margin: 0 }}>آخر الخطب المضافة</h3>
          </div>
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <div className="mobile-hide" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #edf2f7' }}>
              <span style={{ fontWeight: 'bold' }}>عنوان الخطبة</span>
              <span style={{ fontWeight: 'bold' }}>الحالة</span>
              <span style={{ fontWeight: 'bold' }}>الإجراء</span>
            </div>
            {recentKhutab.map(item => (
              <div key={item.id} className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #edf2f7', gap: '0.5rem' }}>
                <span style={{ fontWeight: 'bold' }}>{item.title}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge" style={{ background: item.status === 'معلق' ? '#fff5f5' : '#f0fff4', color: item.status === 'معلق' ? '#e53e3e' : 'var(--primary-green)' }}>{item.status}</span>
                  <a href="/admin/khutab" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>مراجعة ←</a>
                </div>
              </div>
            ))}
            
            {recentKhutab.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  لا توجد خطب مضافة حتى الآن.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
