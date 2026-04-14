"use client";

import { useEffect, useState } from 'react';

export default function KhutabPage() {
  const [khutab, setKhutab] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isClient, setIsClient] = useState(false);
  
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    setIsClient(true);
    
    // سحب التصنيفات ومعاملات البحث من الرابط بطريقة آمنة
    const urlParams = new URL(window.location.href).searchParams;
    setCurrentCategory(urlParams.get('category') || '');
    setCurrentSearch(urlParams.get('search') || '');
    // جلب الخطب المنشورة من قاعدة البيانات العميقة
    fetch('/api/khutab?status=منشور')
      .then(res => res.json())
      .then(data => {
         if (data.success) {
            setKhutab(data.data);
         }
      })
      .catch(err => console.error("Error fetching khutab:", err));

    // جلب التصنيفات
    const savedCats = localStorage.getItem('categories');
    if (savedCats) {
      setCategories(JSON.parse(savedCats));
    }
  }, []);

  if (!isClient) return <div style={{ padding: '3rem', textAlign: 'center' }}>جاري التحميل...</div>;

  let filteredKhutab = [...khutab];
  if (currentCategory) {
    filteredKhutab = filteredKhutab.filter(k => k.category === currentCategory);
  }
  if (currentSearch) {
    const s = currentSearch.toLowerCase();
    filteredKhutab = filteredKhutab.filter(k => 
      k.title.toLowerCase().includes(s) || 
      k.preacher.toLowerCase().includes(s) ||
      (k.content && k.content.toLowerCase().includes(s))
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: 0 }}>مكتبة الخطب</h1>
        <form className="glass-panel stack-mobile" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
           <input 
              type="text" 
              name="search"
              defaultValue={currentSearch}
              placeholder="ابحث عن خطبة..." 
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', minWidth: '200px', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>بحث</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* شريط التصنيفات الجانبي */}
        <div className="card sidebar" style={{ width: '100%', flexShrink: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7', fontWeight: 'bold' }}>
            التصنيفات المتاحة
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <a href="/khutab" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #edf2f7', background: !currentCategory ? '#f8f9fa' : 'transparent', color: !currentCategory ? 'var(--primary-green)' : 'inherit', fontWeight: !currentCategory ? 'bold' : 'normal' }}>
              جميع الخطب
            </a>
            {categories.map((cat, i) => (
              <a 
                key={i} 
                href={`/khutab?category=${encodeURIComponent(cat)}`} 
                style={{ 
                  padding: '1rem 1.5rem', borderBottom: '1px solid #edf2f7',
                  background: currentCategory === cat ? '#f8f9fa' : 'transparent',
                  color: currentCategory === cat ? 'var(--primary-green)' : 'inherit',
                  fontWeight: currentCategory === cat ? 'bold' : 'normal',
                  transition: 'background 0.2s'
                }}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        {/* شبكة الخطب */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            تم العثور على {filteredKhutab.length} خطبة منشورة.
          </p>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filteredKhutab.map(khutba => (
              <div key={khutba.id} className="card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
                  <span className="badge" style={{ marginBottom: '1rem' }}>{khutba.category}</span>
                  <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{khutba.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 {khutba.preacher}</div>
                </div>
                <div className="card-body" style={{ background: '#fafafa' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {khutba.content}
                  </p>
                  
                  {/* علامات تدل على وجود مرفقات */}
                  {khutba.files && Object.keys(khutba.files).length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      {khutba.files.youtube && <span title="تحتوي على فيديو يوتيوب" style={{ fontSize: '1rem' }}>🎥</span>}
                      {khutba.files.audio && <span title="تحتوي على ملف صوتي" style={{ fontSize: '1rem' }}>🎵</span>}
                      {khutba.files.video && <span title="تحتوي على ملف مرئي" style={{ fontSize: '1rem' }}>🎞️</span>}
                      {khutba.files.pdf && <span title="تحتوي على ملف بي دي اف" style={{ fontSize: '1rem' }}>📄</span>}
                      {khutba.files.word && <span title="تحتوي على ملف وورد" style={{ fontSize: '1rem' }}>📝</span>}
                    </div>
                  )}

                  <div className="flex-between" style={{ marginTop: 'auto' }}>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {khutba.date}</span>
                     <a href={`/khutab/${khutba._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>اقرأ واستمع</a>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredKhutab.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-lg)' }}>
                 <p>لم يتم العثور على خطب تطابق معايير البحث الحالية.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
