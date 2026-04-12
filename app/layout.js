import './globals.css';

export const metadata = {
  title: 'المنابر | منصة للحوار والتعبير',
  description: 'بوابتكم لخطب الجمعة الشريفة، مع أحدث الخطب من مصادر موثوقة، بحث سريع، وتحميل فوري.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <nav style={{ background: 'white', boxShadow: 'var(--shadow-sm)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 50 }}>
          <div className="container flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src="/logo.png" alt="شعار المنابر" style={{ height: '50px' }} />
              <h2 style={{ margin: 0, color: 'var(--primary-blue)', fontSize: '1.5rem' }}>المنابر</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontWeight: '600', color: 'var(--primary-blue)' }}>
              <a href="/">الرئيسية</a>
              <a href="/about">من نحن</a>
              <a href="/khutab">الخطب</a>
              <a href="/prayer-times">أوقات الصلاة</a>
              <a href="/contact">اتصل بنا</a>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/auth" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>تسجيل الدخول</a>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1 }}>{children}</main>

        <footer style={{ background: 'var(--primary-blue)', color: 'white', padding: '3rem 0', marginTop: 'auto' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="المنابر" style={{ height: '60px', marginBottom: '1rem', filter: 'brightness(0) invert(1)' }} />
            <p style={{ opacity: 0.8, maxWidth: '500px', margin: '0 auto 2rem' }}>
              منصة متكاملة توفر خطب الجمعة المكتوبة والمسجلة لتسهيل وصول الأئمة والمصلين إليها.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', opacity: 0.6, fontSize: '0.875rem' }}>
              © {new Date().getFullYear()} موقع المنابر. جميع الحقوق محفوظة.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
