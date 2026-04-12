"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      router.push('/admin'); 
    } else {
      setIsLoading(false);
      // جلب المستخدمين من الخادم السحابي
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setUsers(data.data);
            }
        })
        .catch(err => console.error("خادم المستخدمين معطل."));
    }
  }, [router]);

  const handleApprove = async (email) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verified: true })
      });
      const data = await res.json();
      if(data.success) {
        setUsers(users.map(u => u.email === email ? data.data : u));
      } else {
        alert("فشل التنشيط.");
      }
    } catch(err) {
      alert("تعذر الاتصال بقاعدة البيانات لتنشيط الحساب.");
    }
  };

  const handleDelete = async (email) => {
    if (email === 'admin@almanabir.com') {
      return alert('لا يمكن حذف حساب المدير العام.');
    }
    if (confirm('هل أنت متأكد من حذف هذا العضو بشكل نهائي من القاعدة السحابية؟')) {
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
          setUsers(users.filter(u => u.email !== email));
        } else {
          alert('فشل عملية الحذف.');
        }
      } catch(err) {
        alert("خطأ في الخادم.");
      }
    }
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>&rarr; العودة للوحة الإدارة</a>
        <h1>إدارة الأعضاء</h1>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
                <th style={{ padding: '1rem' }}>الاسم</th>
                <th style={{ padding: '1rem' }}>البريد الإلكتروني</th>
                <th style={{ padding: '1rem' }}>الصلاحية</th>
                <th style={{ padding: '1rem' }}>الحالة</th>
                <th style={{ padding: '1rem' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ background: u.role === 'admin' ? '#eebfcs' : '#edf2f7', color: 'var(--text-main)' }}>
                      {u.role === 'admin' ? 'مدير' : 'عضو'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ background: u.verified ? '#f0fff4' : '#fff5f5', color: u.verified ? 'var(--primary-green)' : '#e53e3e' }}>
                      {u.verified ? 'نشط' : 'بانتظار التأكيد'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!u.verified && (
                        <button onClick={() => handleApprove(u.email)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>تنشيط الحساب</button>
                      )}
                      {u.email !== 'admin@almanabir.com' && (
                        <button onClick={() => handleDelete(u.email)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'red', borderColor: 'red' }}>حذف</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              لا يوجد أعضاء مسجلين.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
