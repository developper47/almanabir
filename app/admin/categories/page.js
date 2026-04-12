"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [newCat, setNewCat] = useState('');

  const [categories, setCategories] = useState([]);

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
        const defaultCats = ["العبادات", "القرآن والسنة", "الأخلاق والآداب", "الأسرة والمجتمع", "المناسبات الدينية", "الفقه والأحكام", "السيرة النبوية", "قضايا معاصرة"];
        setCategories(defaultCats);
        localStorage.setItem('categories', JSON.stringify(defaultCats));
      }
    }
  }, [router]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCat && !categories.includes(newCat)) {
      const newCats = [...categories, newCat];
      setCategories(newCats);
      localStorage.setItem('categories', JSON.stringify(newCats));
      setNewCat('');
      alert('تم إضافة التصنيف الجديد بنجاح');
    }
  };

  const handleDeleteCategory = (cat) => {
    if (confirm(`هل أنت متأكد من حذف تصنيف: "${cat}"؟`)) {
      const newCats = categories.filter(c => c !== cat);
      setCategories(newCats);
      localStorage.setItem('categories', JSON.stringify(newCats));
    }
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>&rarr; العودة للوحة الإدارة</a>
        <h1>إدارة التصنيفات</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>اسم التصنيف الجديد</label>
              <input 
                type="text" 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="مثال: فتاوى رمضانية" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-gold">إضافة التصنيف</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
           <h3 style={{ margin: 0 }}>التصنيفات المتاحة ({categories.length})</h3>
        </div>
        <div>
          {categories.map((cat, index) => (
            <div key={index} className="flex-between" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #edf2f7', background: index % 2 === 0 ? '#fafafa' : 'white' }}>
              <span style={{ fontWeight: 'bold' }}>{cat}</span>
              <button 
                onClick={() => handleDeleteCategory(cat)} 
                className="btn btn-outline" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'red', borderColor: 'red' }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
