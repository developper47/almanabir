import { useState, useEffect } from 'react';

function AdviceCard({ topic }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { title, content, views, _id } = topic;
  
  // Create a short preview of the text
  const preview = content.length > 200 ? content.slice(0, 200) + "..." : content;

  const handleToggle = async () => {
    if (!isExpanded) {
      // Trigger view count on expand
      fetch(`/api/zad-al-khatib/${_id}`);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', transition: 'all 0.3s ease' }}>
      <div className="card-body" style={{ padding: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--primary-green)', borderRight: '4px solid var(--accent-gold)', paddingRight: '1rem', margin: 0 }}>
            {title}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👁️ {views} مشاهدة</span>
        </div>
        <p style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
          {isExpanded ? content : preview}
        </p>
        <button 
          onClick={handleToggle}
          style={{ 
            marginTop: '1.5rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary-blue)', 
            fontWeight: '700', 
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          {isExpanded ? 'عرض أقل ↑' : 'اقرأ كاملاً ←'}
        </button>
      </div>
    </div>
  );
}

export default function ZadAlKhatibPage() {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/zad-al-khatib')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTopics(data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '4rem', 
          padding: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(5px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid rgba(200, 168, 92, 0.2)'
        }} className="animate-fade-in">
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>زاد الخطيب</h1>
          <div style={{ width: '80px', height: '4px', background: 'var(--accent-gold)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            نصائح وتوجيهات للارتقاء بالأداء المنبري وتحقيق أقصى درجات التأثير في جمهور المصلين.
          </p>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>جاري تحميل المواضيع...</div>
        ) : (
          <div className="grid-list">
            {topics.map((topic, index) => (
              <div key={topic._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <AdviceCard topic={topic} />
              </div>
            ))}
            
            {topics.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                لا توجد مواضيع متاحة حالياً في زاد الخطيب.
              </div>
            )}
          </div>
        )}

        <footer style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          backgroundColor: 'var(--primary-blue)', 
          padding: '3rem 2rem', 
          borderRadius: 'var(--radius-lg)', 
          color: 'white',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>هل لديك نصيحة تود مشاركتها؟</h2>
          <p style={{ marginBottom: '2rem', opacity: '0.9' }}>نحن نسعى دائماً لإثراء هذا المحتوى بخبراتكم وتجاربكم القيمة في الدعوة والخطابة.</p>
          <a href="/contact" className="btn btn-gold">تواصل معنا الآن</a>
        </footer>
      </div>
    </div>
  );
}

            color: 'var(--primary-blue)', 
            fontWeight: '700', 
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          {isExpanded ? 'عرض أقل ↑' : 'اقرأ كاملاً ←'}
        </button>
      </div>
    </div>
  );
}

export default function SuccessfulPreacherPage() {
  return (
    <div>
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '4rem', 
          padding: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(5px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid rgba(200, 168, 92, 0.2)'
        }} className="animate-fade-in">
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>الخطيب الناجح</h1>
          <div style={{ width: '80px', height: '4px', background: 'var(--accent-gold)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            نصائح وتوجيهات للارتقاء بالأداء المنبري وتحقيق أقصى درجات التأثير في جمهور المصلين.
          </p>
        </header>

        <div className="grid-list">
          {adviceData.map((advice, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <AdviceCard title={advice.title} content={advice.content} />
            </div>
          ))}
        </div>

        <footer style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          backgroundColor: 'var(--primary-blue)', 
          padding: '3rem 2rem', 
          borderRadius: 'var(--radius-lg)', 
          color: 'white',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>هل لديك نصيحة تود مشاركتها؟</h2>
          <p style={{ marginBottom: '2rem', opacity: '0.9' }}>نحن نسعى دائماً لإثراء هذا المحتوى بخبراتكم وتجاربكم القيمة في الدعوة والخطابة.</p>
          <a href="/contact" className="btn btn-gold">تواصل معنا الآن</a>
        </footer>
      </div>
    </div>
  );
}
