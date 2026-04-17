"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SingleKhutbaPage({ params }) {
  const router = useRouter();
  const [khutba, setKhutba] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const fetchKhutba = async () => {
      try {
        const res = await fetch(`/api/khutab/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setKhutba(data.data);
          checkIfFavorite(params.id);
        }
      } catch (err) {
        console.error("Error fetching khutba:", err);
      }
    };

    fetchKhutba();
  }, [params.id]);

  const checkIfFavorite = async (id) => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
      const res = await fetch(`/api/favorites?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        const isFav = data.data.some(fav => fav._id === id || fav === id);
        setIsFavorite(isFav);
      }
    } catch (err) {
      console.error("Error checking favorite:", err);
    }
  };

  const handleFavoriteToggle = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/auth');
      return;
    }

    setIsFavoriteLoading(true);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = isFavorite 
        ? `/api/favorites?email=${encodeURIComponent(email)}&khutbaId=${params.id}`
        : `/api/favorites`;
      
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (method === 'POST') {
        options.body = JSON.stringify({ email, khutbaId: params.id });
      }

      const res = await fetch(url, options);
      const data = await res.json();
      if (data.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isClient) return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري التحميل...</div>;
  
  if (!khutba) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>الخطبة غير موجودة أو تم حذفها.</h2>
        <a href="/khutab" className="btn btn-primary" style={{ marginTop: '1rem' }}>العودة للمكتبة</a>
      </div>
    );
  }

  // تحسين رابط اليوتيوب ليصبح رابط تضمين (Embed)
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const hasMedia = khutba.files && (khutba.files.youtube || khutba.files.video || khutba.files.audio);
  const hasDocuments = khutba.files && (khutba.files.pdf || khutba.files.word);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <style jsx global>{`
        @media print {
          nav, footer, .no-print, .media-section, .doc-section, .badge {
            display: none !important;
          }
          .container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
          }
          .khutba-content {
            font-size: 24pt !important;
            line-height: 1.8 !important;
            color: black !important;
            text-align: right !important;
          }
          .khutba-title {
            font-size: 32pt !important;
            margin-bottom: 2cm !important;
            text-align: center !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
      
      <div className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
        
        {/* أزرار الإجراءات السريعة Quick Actions */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', padding: '1rem 2rem' }}>
          <button 
            onClick={handleFavoriteToggle}
            className="btn btn-outline"
            style={{ 
              borderColor: isFavorite ? 'var(--primary-green)' : '#cbd5e0',
              color: isFavorite ? 'var(--primary-green)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
            disabled={isFavoriteLoading}
          >
            {isFavorite ? '⭐ في المفضلة' : '☆ أضف للمفضلة'}
          </button>
          <button 
            onClick={handlePrint}
            className="btn btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            🖨️ تجهيز للطباعة
          </button>
        </div>

        {/* معلومات الخطبة Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>
          <span className="badge" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            {khutba.category}
          </span>
          <h1 className="khutba-title" style={{ marginBottom: '1.5rem', lineHeight: '1.4' }}>{khutba.title}</h1>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)' }} className="no-print">
            <span>👤 <strong>الخطيب:</strong> {khutba.preacher}</span>
            <span>📅 <strong>تاريخ النشر:</strong> {khutba.date}</span>
            <span>👁️ <strong>المشاهدات:</strong> {khutba.views || 0}</span>
          </div>
        </div>

        {/* المرفقات والوسائط Media Section */}
        {hasMedia && (
          <div className="media-section no-print" style={{ background: '#1a202c', padding: '2rem', color: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'white', textAlign: 'center', fontSize: '1.2rem' }}>التسجيلات المرئية والصوتية</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* يوتيوب */}
              {khutba.files.youtube && (
                <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <iframe 
                    width="100%" height="400" 
                    src={getEmbedUrl(khutba.files.youtube)} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
              )}

              {/* فيديو MP4 مباشر */}
              {khutba.files.video && (
                <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
                  <video width="100%" height="300" controls>
                    <source src={khutba.files.video} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                </div>
              )}
              
              {/* صوت MP3 */}
              {khutba.files.audio && (
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <strong style={{ whiteSpace: 'nowrap', fontSize: '1.1rem' }}>🎵 استمع للخطبة صوتاً:</strong>
                  <audio controls style={{ width: '100%', flex: 1, minWidth: '200px' }}>
                    <source src={khutba.files.audio} type="audio/mpeg" />
                    متصفحك لا يدعم تشغيل الصوت.
                  </audio>
                </div>
              )}
            </div>
          </div>
        )}

        {/* روابط التحميل للمستندات Documents */}
        {hasDocuments && (
          <div className="doc-section no-print" style={{ background: '#f8f9fa', padding: '1.5rem 2rem', borderBottom: '1px solid #edf2f7' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>تحميل المرفقات النصية:</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {khutba.files.pdf && (
                <a href={khutba.files.pdf} target="_blank" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: '#e53e3e', color: '#e53e3e' }}>
                  📄 تصفح أو تحميل ملف PDF
                </a>
              )}
              {khutba.files.word && (
                <a href={khutba.files.word} target="_blank" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: '#3182ce', color: '#3182ce' }}>
                  📝 تحميل ملف وورد (Word)
                </a>
              )}
            </div>
          </div>
        )}

        {/* محتوى الخطبة النصي Content */}
        <div style={{ padding: '3rem 2rem' }}>
           <h3 className="no-print" style={{ borderBottom: '2px solid var(--primary-green)', paddingBottom: '0.5rem', marginBottom: '2rem', display: 'inline-block' }}>نص الخطبة</h3>
           <div className="khutba-content" style={{ fontSize: '1.4rem', lineHeight: '2.5', whiteSpace: 'pre-wrap', color: '#2d3748', textAlign: 'justify' }}>
             {khutba.content}
           </div>
        </div>

      </div>
    </div>
  );
}
