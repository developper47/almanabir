"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminZadAlKhatibPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', order: 0 });

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/auth');
    } else {
      fetchTopics();
      setIsLoading(false);
    }
  }, [router]);

  const fetchTopics = async () => {
    const res = await fetch('/api/zad-al-khatib');
    const data = await res.json();
    if (data.success) setTopics(data.data);
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
      await fetch(`/api/zad-al-khatib/${id}`, { method: 'DELETE' });
      setTopics(topics.filter(t => t._id !== id));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', order: topics.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (topic) => {
    setEditingId(topic._id);
    setFormData({ title: topic.title, content: topic.content, order: topic.order });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/zad-al-khatib/${editingId}` : '/api/zad-al-khatib';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      fetchTopics();
      setIsModalOpen(false);
    }
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <a href="/admin" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>&rarr; العودة للوحة الإدارة</a>
          <h1>إدارة زاد الخطيب</h1>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">إضافة موضوع جديد +</button>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
              <th style={{ padding: '1rem' }}>الترتيب</th>
              <th style={{ padding: '1rem' }}>العنوان</th>
              <th style={{ padding: '1rem' }}>المشاهدات</th>
              <th style={{ padding: '1rem' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(t => (
              <tr key={t._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '1rem' }}>{t.order}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.title}</td>
                <td style={{ padding: '1rem' }}>{t.views}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEditModal(t)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem' }}>تعديل</button>
                    <button onClick={() => handleDelete(t._id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', color: 'red', borderColor: 'red' }}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'تعديل موضوع' : 'إضافة موضوع جديد'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="العنوان" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} required />
              <input type="number" placeholder="الترتيب في الظهور" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} required />
              <textarea placeholder="النص" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows="10" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} required></textarea>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
