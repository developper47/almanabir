"use client";

import { useEffect, useState } from 'react';

export default function GenericKhutabPage({ title, filterParam }) {
  const [khutab, setKhutab] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetchKhutab();
  }, []);

  const fetchKhutab = async () => {
    setIsLoading(true);
    try {
      let url = `/api/khutab?status=منشور&${filterParam}=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setKhutab(data.data);
      }
    } catch (err) {
      console.error("Error fetching khutab:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return <div style={{ padding: '3rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: 0 }}>{title}</h1>
        <a href="/khutab" className="btn btn-outline">العودة للمكتبة الشاملة</a>
      </div>

      <div style={{ flex: 1, minWidth: '300px' }}>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          تم العثور على {khutab.length} خطبة.
        </p>

        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {khutab.map(khutba => (
            <div key={khutba._id} className="card">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
                <span className="badge" style={{ marginBottom: '1rem' }}>{khutba.category}</span>
                <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{khutba.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 {khutba.preacher}</div>
              </div>
              <div className="card-body" style={{ background: '#fafafa' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {khutba.content}
                </p>
                <div className="flex-between" style={{ marginTop: 'auto' }}>
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {khutba.date}</span>
                   <a href={`/khutab/${khutba._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>اقرأ واستمع</a>
                </div>
              </div>
            </div>
          ))}
          
          {khutab.length === 0 && !isLoading && (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-lg)' }}>
               <p>لا توجد خطبة في هذا القسم حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
