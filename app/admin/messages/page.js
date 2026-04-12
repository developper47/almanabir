"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      router.push('/admin');
    } else {
      setIsLoading(false);
      const savedMessages = localStorage.getItem('messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [router]);

  const handleDelete = (id) => {
    if (confirm('حذف هذه الرسالة؟')) {
      const updatedMessages = messages.filter(m => m.id !== id);
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
    }
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>&rarr; العودة للوحة الإدارة</a>
        <h1>صندوق الوارد ({messages.length})</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map(msg => (
          <div key={msg.id} className="card">
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{msg.subject}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    من: <strong>{msg.name}</strong> ({msg.email})
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{msg.date}</div>
                  <button onClick={() => handleDelete(msg.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️ حذف</button>
                </div>
              </div>
              <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </p>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            لا يوجد رسائل جديدة في صندوق الوارد.
          </div>
        )}
      </div>
    </div>
  );
}
