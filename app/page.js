import dbConnect from '../lib/mongodb';
import Khutba from '../models/Khutba';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let latestKhutab = [];
  
  try {
    await dbConnect();
    
    // جلب آخر 3 خطب منشورة
    latestKhutab = await Khutba.find({ status: 'منشور' })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  } catch (error) {
    console.error("Home page DB error:", error);
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container flex-between" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }} className="animate-fade-in">
            <h1>بوابتكم لخطب الجمعة الشريفة</h1>
            <p style={{ margin: '0 auto 2rem' }}>
              ارتقِ بمعرفتك الدينية واصل إلى أحدث خطب الجمعة من مصادر موثوقة. 
              نقدم لكم محتوى راقٍ ومنظم لخدمة الخطباء والمصلين.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'inherit', flexWrap: 'wrap' }}>
              <a href="/khutab" className="btn btn-primary">تصفح الخطب</a>
              <a href="/auth" className="btn btn-gold">شارك معنا</a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <form action="/khutab" method="GET" className="glass-panel stack-mobile" style={{ padding: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              name="search"
              type="text" 
              placeholder="ابحث عن عنوان خطبة، اسم خطيب، أو موضوع..." 
              style={{ width: '100%', flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem', width: 'auto', minWidth: '150px' }}>
              بحث
            </button>
          </form>
        </div>
      </section>

      {/* Most Recent Khutab */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <h2>أحدث الخطب المضافة</h2>
            <a href="/khutab" style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>عرض الكل ←</a>
          </div>

          <div className="grid-3">
            {latestKhutab.map((khutba) => (
              <div key={khutba._id.toString()} className="card">
                <div style={{ height: '160px', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
                  <img src="/logo.png" style={{ height: '80px', opacity: 0.2, filter: 'brightness(0) invert(1)' }} alt="" />
                  <span className="badge" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white' }}>
                    {khutba.category}
                  </span>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{khutba.title}</h3>
                  <div className="card-meta">
                    <span>👤 {khutba.preacher}</span>
                    <span>📅 {khutba.date}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {khutba.content}
                  </p>
                  
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #edf2f7', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href={`/khutab/${khutba._id}`} className="btn" style={{ background: '#edf2f7', color: 'var(--primary-blue)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      اقرأ المزيد
                    </a>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👁️ {khutba.views} مشاهدة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Categories */}
      <section style={{ background: 'white', padding: '5rem 0' }}>
        <div className="container text-center">
          <h2 style={{ textAlign: 'center' }}>تصفح حسب الموضوع</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>
            لقد قمنا بتصنيف الخطب لنسهل عليك عملية البحث والوصول للموضوع المراد بسرعة
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {['العبادات', 'القرآن والسنة', 'الأخلاق والآداب', 'الأسرة والمجتمع', 'المناسبات الدينية', 'الفقه والأحكام', 'السيرة النبوية'].map((cat, i) => (
              <a key={i} href={`/khutab?category=${cat}`} className="btn btn-outline" style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}>
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance Section */}
      <section style={{ padding: '3rem 0', background: '#f0fff4' }}>
        <div className="container">
          <div style={{ 
            padding: '2rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '2px solid var(--primary-green)',
            background: 'white',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>💡 ضمان جودة المحتوى</h3>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              جميع الخطب المقترحة تتم مراجعتها من طرف نخبة من العلماء الشرعيين مع امكانية تعديلها قبل نشرها لضمان جودة الخطب على الموقع.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
