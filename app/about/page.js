export const metadata = {
  title: 'من نحن | المنابر',
  description: 'تعرف على رؤية ورسالة منصة المنابر لخطب الجمعة.',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <div className="card">
        <div style={{ padding: '3rem 2rem', textAlign: 'center', borderBottom: '1px solid #edf2f7' }}>
          <img src="/logo.png" alt="شعار المنابر" style={{ height: '80px', marginBottom: '1.5rem' }} />
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>عن منصة المنابر</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            بوابتكم لخطب الجمعة الشريفة والمحتوى الديني الراقي.
          </p>
        </div>

        <div className="card-body" style={{ padding: '2rem 3rem', lineHeight: '2' }}>
          <h2 style={{ color: 'var(--primary-green)' }}>رؤيتنا</h2>
          <p style={{ marginBottom: '2rem' }}>
            نسعى في "المنابر" إلى أن نكون الوجهة الأولى للخطباء والأئمة والمصلين للوصول إلى محتوى دینی رصين ومنظم، يعزز الوعي ويرتقي بالخطاب الديني وفق منهج وسطي معتدل.
          </p>

          <h2 style={{ color: 'var(--primary-green)' }}>ماذا نقدم؟</h2>
          <ul style={{ marginBottom: '2rem', paddingRight: '1.5rem' }}>
            <li>قاعدة بيانات ضخمة من خطب الجمعة المصنفة بعناية.</li>
            <li>خاصية البحث السريع والمتقدم عبر الكلمات المفتاحية والمواضيع.</li>
            <li>إمكانية تحميل الخطب بصيغ متعددة (PDF, Word, صوت، مرئي).</li>
            <li>مشاركة الخطباء المعتمدين لخطبهم لإثراء المنصة.</li>
          </ul>

          <h2 style={{ color: 'var(--primary-green)' }}>الجمهور المستهدف</h2>
          <p style={{ marginBottom: '2rem' }}>
            تم تصميم هذه المنصة لخدمة الأئمة والخطباء في إعداد دروسهم بخامات متينة، بالإضافة إلى الباحثين والمصلين الراغبين في التزود بالعلم الشرعي.
          </p>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a href="/contact" className="btn btn-outline">تواصل معنا</a>
          </div>
        </div>
      </div>
    </div>
  );
}
