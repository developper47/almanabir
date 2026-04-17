"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyLibraryPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/auth');
      return;
    }
    fetchFavorites(email);
  }, []);

  const fetchFavorites = async (email) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/favorites?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (khutbaId) => {
    const email = localStorage.getItem('userEmail');
    try {
      const res = await fetch(`/api/favorites?email=${encodeURIComponent(email)}&khutbaId=${khutbaId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(favorites.filter(f => f._id !== khutbaId));
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (!isClient) return null;

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-blue)' }}>مكتبتي الخاصة</h1>
        <p style={{ color: 'var(--text-muted)' }}>الخطب والمواضيع التي قمت بحفظها للرجوع إليها لاحقاً</p>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>جاري تحميل مكتبتك...</div>
      ) : (
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {favorites.map(item => (
            <div key={item._id} className="card">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
                <span className="badge" style={{ marginBottom: '1rem' }}>{item.category}</span>
                <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 {item.preacher}</div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.content}
                </p>
                <div className="flex-between">
                  <a href={`/khutab/${item._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>عرض الخطبة</a>
                  <button onClick={() => handleRemove(item._id)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.9rem' }}>❌ إزالة</button>
                </div>
              </div>
            </div>
          ))}

          {favorites.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📚</div>
              <h3>مكتبتك خالية حالياً</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>ابدأ بتصفح الخطب وأضف ما ينال إعجابك إلى مفضلتك.</p>
              <a href="/khutab" className="btn btn-primary" style={{ display: 'inline-block' }}>تصفح الخطب الآن</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
