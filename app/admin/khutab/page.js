"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminKhutabPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [khutab, setKhutab] = useState([]);
  const [categories, setCategories] = useState([]);

  // إدارة النافذة المنبثقة (Modal) للإضافة والتعديل
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = { 
    title: '', category: '', preacher: '', status: 'منشور', content: '',
    youtubeUrl: '', audioUrl: '', videoUrl: '', pdfUrl: '', wordUrl: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/auth');
    } else {
      setIsLoading(false);
      
      const savedCats = localStorage.getItem('categories');
      if (savedCats) {
         setCategories(JSON.parse(savedCats));
      } else {
         setCategories(["العبادات"]);
      }
      
      // جلب الخطب الحقيقية من MongoDB السحابية
      fetch('/api/khutab')
        .then(res => res.json())
        .then(data => {
            if (data.success) setKhutab(data.data);
        })
        .catch(err => console.error("تأكد من إعدادات قاعدة البيانات."));
    }
  }, [router]);

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الخطبة نهائياً من قاعدة البيانات السحابية؟')) {
      try {
        const res = await fetch(`/api/khutab/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
           setKhutab(khutab.filter(k => k._id !== id));
        } else {
           alert("تعذر الحذف.");
        }
      } catch(err) {
        alert("حدث خطأ في الاتصال بالخادم.");
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/khutab/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'منشور' })
      });
      const data = await res.json();
      if(data.success) {
         setKhutab(khutab.map(k => k._id === id ? data.data : k));
      }
    } catch(err) {
      alert("حدث خطأ أثناء الموافقة.");
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (khutba) => {
    setEditingId(khutba._id);
    const files = khutba.files || {};
    setFormData({ 
      title: khutba.title, 
      category: khutba.category, 
      preacher: khutba.preacher, 
      status: khutba.status,
      content: khutba.content || '',
      youtubeUrl: files.youtube || '',
      audioUrl: files.audio || '',
      videoUrl: files.video || '',
      pdfUrl: files.pdf || '',
      wordUrl: files.word || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveKhutba = async (e) => {
    e.preventDefault();
    
    const files = {};
    if (formData.youtubeUrl) files.youtube = formData.youtubeUrl;
    if (formData.audioUrl) files.audio = formData.audioUrl;
    if (formData.videoUrl) files.video = formData.videoUrl;
    if (formData.pdfUrl) files.pdf = formData.pdfUrl;
    if (formData.wordUrl) files.word = formData.wordUrl;

    const khutbaDataToSave = {
      title: formData.title,
      category: formData.category,
      preacher: formData.preacher,
      status: formData.status,
      content: formData.content,
      files: files,
      date: new Date().toLocaleDateString('en-CA')
    };

    try {
      if (editingId) {
        // تحديث الخطبة السحابية
        const res = await fetch(`/api/khutab/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(khutbaDataToSave)
        });
        const data = await res.json();
        if(data.success) {
          setKhutab(khutab.map(k => k._id === editingId ? data.data : k));
        } else {
          alert('تعذر تحديث الخطبة: ' + data.error);
        }
      } else {
        // إضافة خطبة سحابية جديدة
        const res = await fetch('/api/khutab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(khutbaDataToSave)
        });
        const data = await res.json();
        if(data.success) {
          setKhutab([data.data, ...khutab]);
        } else {
          alert('تعذر حفظ الخطبة: ' + data.error);
        }
      }
      setIsModalOpen(false);
    } catch(err) {
       alert("حدث خطأ في الاتصال بالشبكة ولم يتم الحفظ.");
    }
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', position: 'relative' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <a href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>&rarr; العودة للوحة الإدارة</a>
          <h1>إدارة الخطب</h1>
          <p style={{ color: 'var(--text-muted)' }}>متصلة بقاعدة البيانات السحابية (MongoDB)</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">إضافة خطبة جديدة +</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
                <th style={{ padding: '1rem' }}>عنوان الخطبة</th>
                <th style={{ padding: '1rem' }}>التصنيف</th>
                <th style={{ padding: '1rem' }}>الخطيب</th>
                <th style={{ padding: '1rem' }}>الحالة</th>
                <th style={{ padding: '1rem' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {khutab.map(k => (
                <tr key={k._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{k.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{k.category}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{k.preacher}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ background: k.status === 'معلق' ? '#fff5f5' : '#f0fff4', color: k.status === 'معلق' ? '#e53e3e' : 'var(--primary-green)' }}>
                      {k.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {k.status === 'معلق' && (
                        <button onClick={() => handleApprove(k._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>موافقة</button>
                      )}
                      <button onClick={() => openEditModal(k)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>تعديل</button>
                      <button onClick={() => handleDelete(k._id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'red', borderColor: 'red' }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {khutab.length === 0 && (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد خطب متاحة.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '95vh', overflowY: 'auto', padding: '2rem', margin: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
              {editingId ? 'تعديل الخطبة (MongoDB)' : 'إضافة خطبة جديدة'}
            </h2>
            
            <form onSubmit={handleSaveKhutba} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>عنوان الخطبة</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0' }} required />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>اسم الخطيب</label>
                    <input type="text" value={formData.preacher} onChange={(e) => setFormData({...formData, preacher: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0' }} required />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>التصنيف</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white' }}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>حالة النشر</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white' }}>
                      <option value="منشور">نشر للعموم</option>
                      <option value="معلق">حفظ كمسودة (معلق)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fff4', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #c6f6d5' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary-green)' }}>المرفقات والوسائط (روابط خارجية - اختيارية)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🎥 رابط يوتيوب (YouTube)</label>
                    <input type="url" placeholder="https://youtube.com/..." value={formData.youtubeUrl} onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', direction: 'ltr' }} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🎵 ملف صوتي (MP3 URL)</label>
                    <input type="url" placeholder="http://.../audio.mp3" value={formData.audioUrl} onChange={(e) => setFormData({...formData, audioUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', direction: 'ltr' }} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🎞️ ملف مرئي (MP4 URL)</label>
                    <input type="url" placeholder="http://.../video.mp4" value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', direction: 'ltr' }} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📄 ملف نصي (PDF URL)</label>
                    <input type="url" placeholder="http://.../file.pdf" value={formData.pdfUrl} onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', direction: 'ltr' }} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📝 ملف وورد (Word DOCX URL)</label>
                    <input type="url" placeholder="http://.../file.docx" value={formData.wordUrl} onChange={(e) => setFormData({...formData, wordUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', direction: 'ltr' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>النص المكتوب (مضمون الخطبة)</label>
                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="8"
                  placeholder="اكتب المحتوى هنا..."
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', outline: 'none', resize: 'vertical' }} 
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>حفظ الخطبة</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '1rem' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
