"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SingleKhutbaPage({ params }) {
  const router = useRouter();
  const [khutba, setKhutba] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showRegisterMessage, setShowRegisterMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
    
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
      setShowRegisterMessage(true);
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

  // مشاركة الخطبة عبر شبكات التواصل الاجتماعي الأربع الأكثر استعمالاً
  const handleShare = (platform) => {
    const url = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const title = `خطبة: "${khutba?.title}" للشيخ ${khutba?.preacher} - عبر منصة المنابر`;
    let shareLink = '';

    switch (platform) {
      case 'whatsapp':
        // واتساب: إرسال العنوان ورابط الخطبة المباشر
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + url)}`;
        break;
      case 'facebook':
        // فيسبوك: مشاركة الرابط ليتم توجيه المتلقي إليه
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        // منصة إكس (تويتر): مشاركة التغريدة مع الرابط
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'telegram':
        // تيليجرام: إرسال الرابط والعنوان في المحادثة
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      default:
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=550');
    }
  };

  const handleCopyLink = async () => {
    const url = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
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

  // التحقق من صحة الروابط لمنع هجمات XSS
  const getSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return null;
  };

  // تحسين رابط اليوتيوب ليصبح رابط تضمين (Embed) آمن
  const getEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) return null;
    if (trimmed.includes('youtube.com/watch?v=')) return trimmed.replace('watch?v=', 'embed/');
    if (trimmed.includes('youtu.be/')) return trimmed.replace('youtu.be/', 'youtube.com/embed/');
    if (trimmed.includes('youtube.com/embed/')) return trimmed;
    return null;
  };

  const hasMedia = khutba.files && (khutba.files.youtube || khutba.files.video || khutba.files.audio);
  const safePdfUrl = getSafeUrl(khutba.files?.pdf);
  const safeWordUrl = getSafeUrl(khutba.files?.word);
  const hasDocuments = Boolean(safePdfUrl || safeWordUrl);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <style jsx global>{`
        @media print {
          nav, footer, .no-print, .media-section, .doc-section, .badge, .share-section {
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
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-between', alignItems: 'center', gap: '0.8rem', padding: '1rem 2rem', flexWrap: 'wrap', borderBottom: '1px solid #edf2f7' }}>
          <a href="/khutab" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
            &rarr; العودة للخطب
          </a>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
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
              {isFavorite ? '⭐ في مكتبتي' : '☆ أضف إلى مكتبتي'}
            </button>
            
            {showRegisterMessage && (
              <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                background: '#e53e3e', color: 'white', padding: '1rem 2rem', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1rem',
                animation: 'fadeInDown 0.3s ease-out'
              }}>
                <span>يجب عليك تسجيل الدخول أو إنشاء حساب لإضافة الخطب إلى مكتبتك الخاصة.</span>
                <button onClick={() => setShowRegisterMessage(false)} style={{ background: 'white', border: 'none', color: '#e53e3e', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>إغلاق</button>
              </div>
            )}
            <button 
              onClick={handlePrint}
              className="btn btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              🖨️ تجهيز للطباعة
            </button>
          </div>
        </div>

        {/* معلومات الخطبة Header */}
        <div style={{ padding: '2.5rem 2rem 1.5rem', textAlign: 'center' }}>
          <span className="badge" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            {khutba.category}
          </span>
          <h1 className="khutba-title" style={{ marginBottom: '1.5rem', lineHeight: '1.4' }}>{khutba.title}</h1>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)' }} className="no-print">
            <span>👤 <strong>الخطيب:</strong> {khutba.preacher}</span>
            <span>📅 <strong>تاريخ النشر:</strong> {khutba.date}</span>
            <span>👁️ <strong>المشاهدات:</strong> {khutba.views || 0}</span>
          </div>

          {/* شريط مشاركة الخطبة عبر وسائل التواصل الاجتماعي الأربع الأكثر استعمالاً */}
          <div className="no-print share-section" style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px dashed #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📢</span> ساهم في نشر هذه الخطبة (الدال على الخير كفاعله):
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
              {/* WhatsApp */}
              <button 
                onClick={() => handleShare('whatsapp')}
                className="btn"
                title="مشاركة عبر واتساب"
                style={{ 
                  background: '#25D366', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(37,211,102,0.2)'
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                واتساب
              </button>

              {/* Facebook */}
              <button 
                onClick={() => handleShare('facebook')}
                className="btn"
                title="مشاركة عبر فيسبوك"
                style={{ 
                  background: '#1877F2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(24,119,242,0.2)'
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                فيسبوك
              </button>

              {/* X / Twitter */}
              <button 
                onClick={() => handleShare('twitter')}
                className="btn"
                title="مشاركة عبر منصة إكس"
                style={{ 
                  background: '#000000', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                منصة إكس
              </button>

              {/* Telegram */}
              <button 
                onClick={() => handleShare('telegram')}
                className="btn"
                title="مشاركة عبر تيليجرام"
                style={{ 
                  background: '#229ED9', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(34,158,217,0.2)'
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.194 1.006.131.832.941z"/>
                </svg>
                تيليجرام
              </button>

              {/* نسخ الرابط المباشر */}
              <button 
                onClick={handleCopyLink}
                className="btn btn-outline"
                title="نسخ رابط هذه الخطبة"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  borderColor: copied ? 'var(--primary-green)' : '#cbd5e0',
                  color: copied ? 'var(--primary-green)' : 'var(--text-main)',
                  background: copied ? '#f0fff4' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                {copied ? '✓ تم النسخ!' : 'نسخ الرابط'}
              </button>
            </div>
          </div>
        </div>

        {/* المرفقات والوسائط Media Section */}
        {hasMedia && (
          <div className="media-section no-print" style={{ background: '#1a202c', padding: '2rem', color: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'white', textAlign: 'center', fontSize: '1.2rem' }}>التسجيلات المرئية والصوتية</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* يوتيوب */}
              {khutba.files.youtube && getEmbedUrl(khutba.files.youtube) && (
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
              {khutba.files.video && getSafeUrl(khutba.files.video) && (
                <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
                  <video width="100%" height="300" controls>
                    <source src={getSafeUrl(khutba.files.video)} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                </div>
              )}
              
              {/* صوت MP3 */}
              {khutba.files.audio && getSafeUrl(khutba.files.audio) && (
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <strong style={{ whiteSpace: 'nowrap', fontSize: '1.1rem' }}>🎵 استمع للخطبة صوتاً:</strong>
                  <audio controls style={{ width: '100%', flex: 1, minWidth: '200px' }}>
                    <source src={getSafeUrl(khutba.files.audio)} type="audio/mpeg" />
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
              {safePdfUrl && (
                <a href={safePdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: '#e53e3e', color: '#e53e3e' }}>
                  📄 تصفح أو تحميل ملف PDF
                </a>
              )}
              {safeWordUrl && (
                <a href={safeWordUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: '#3182ce', color: '#3182ce' }}>
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

           {/* أزرار المشاركة السفلية أيضاً لتسهيل النشر بعد القراءة */}
           <div className="no-print share-section" style={{ 
             marginTop: '3rem', 
             padding: '2rem', 
             background: '#f8f9fa', 
             borderRadius: 'var(--radius-lg)',
             border: '1px solid #edf2f7',
             textAlign: 'center'
           }}>
             <h4 style={{ color: 'var(--primary-blue)', marginBottom: '0.8rem' }}>هل نالت هذه الخطبة إعجابك واستفدت منها؟</h4>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
               شارك الرابط عبر وسائل التواصل لتعم الفائدة ويصل الأثر إلى غيرك:
             </p>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
               <button onClick={() => handleShare('whatsapp')} className="btn" style={{ background: '#25D366', color: 'white', border: 'none', padding: '0.5rem 1.2rem' }}>
                 واتساب
               </button>
               <button onClick={() => handleShare('facebook')} className="btn" style={{ background: '#1877F2', color: 'white', border: 'none', padding: '0.5rem 1.2rem' }}>
                 فيسبوك
               </button>
               <button onClick={() => handleShare('twitter')} className="btn" style={{ background: '#000000', color: 'white', border: 'none', padding: '0.5rem 1.2rem' }}>
                 منصة إكس
               </button>
               <button onClick={() => handleShare('telegram')} className="btn" style={{ background: '#229ED9', color: 'white', border: 'none', padding: '0.5rem 1.2rem' }}>
                 تيليجرام
               </button>
               <button onClick={handleCopyLink} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem' }}>
                 {copied ? '✓ تم النسخ!' : 'نسخ الرابط'}
               </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
