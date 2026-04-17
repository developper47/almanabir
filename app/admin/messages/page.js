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
      fetchMessages();
    }
  }, [router]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/messages');
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('حذف هذه الرسالة؟')) {
      try {
        const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setMessages(messages.filter(m => m._id !== id));
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const toggleReadStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'read' ? 'unread' : 'read';
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setMessages(messages.map(m => m._id === id ? { ...m, status: newStatus } : m));
      }
    } catch (error) {
      console.error('Error updating status:', error);
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
          <div key={msg._id} className="card" style={{ 
            borderRight: msg.status === 'unread' ? '5px solid var(--primary-green)' : '1px solid #edf2f7',
            opacity: msg.status === 'read' ? 0.8 : 1
          }}>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{msg.subject}</h3>
                    {msg.status === 'unread' && (
                      <span style={{ 
                        backgroundColor: 'var(--primary-green)', 
                        color: 'white', 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>جديد</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    من: <strong>{msg.name}</strong> ({msg.email})
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {new Date(msg.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => toggleReadStatus(msg._id, msg.status)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--primary-blue)', 
                        cursor: 'pointer', 
                        fontSize: '0.85rem',
                        textDecoration: 'underline'
                      }}
                    >
                      {msg.status === 'read' ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                    </button>
                    <button onClick={() => handleDelete(msg._id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1rem' }} title="حذف">🗑️</button>
                  </div>
                </div>
              </div>
              <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {msg.message}
              </p>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            لا يوجد رسائل في صندوق الوارد.
          </div>
        )}
      </div>
    </div>
  );
}
