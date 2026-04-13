import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'المنابر | منصة للحوار والتعبير',
  description: 'بوابتكم لخطب الجمعة الشريفة، مع أحدث الخطب من مصادر موثوقة، بحث سريع، وتحميل فوري.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

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
