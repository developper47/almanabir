"use client";

import { useState, useEffect } from 'react';

// قاموس الدول والمدن لسحب مواقيت الصلاة
const locationData = {
  "Saudi Arabia": { nameAr: "السعودية", cities: ["Mecca", "Medina", "Riyadh", "Jeddah", "Dammam"] },
  "Egypt": { nameAr: "مصر", cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"] },
  "Algeria": { nameAr: "الجزائر", cities: ["Algiers", "Oran", "Constantine", "Annaba", "Batna"] },
  "Morocco": { nameAr: "المغرب", cities: ["Casablanca", "Rabat", "Marrakesh", "Fes", "Tangier"] },
  "Tunisia": { nameAr: "تونس", cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"] },
  "United Arab Emirates": { nameAr: "الإمارات", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman"] },
};

export default function KhatibServices() {
  const [activeTab, setActiveTab] = useState('prayers');
  
  // شؤون مواقيت الصلاة
  const [country, setCountry] = useState('Saudi Arabia');
  const [city, setCity] = useState('Mecca');
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // شؤون الزكاة
  const [zakatAmount, setZakatAmount] = useState('');
  const [goldPrice, setGoldPrice] = useState(2500); // سعر تقريبي للذهب عيار 24
  const [zakatResult, setZakatResult] = useState(null);

  // شؤون التقويم والمناسبات
  const [calendarData, setCalendarData] = useState(null);

  useEffect(() => {
    fetchPrayerTimes(city, country);
    fetchCalendar(city, country);
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPrayerTimes = async (sCity, sCountry) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(sCity)}&country=${encodeURIComponent(sCountry)}&method=4`);
      const data = await res.json();
      if (data.code === 200) setPrayerData(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchCalendar = async (sCity, sCountry) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(sCity)}&country=${encodeURIComponent(sCountry)}&method=4`);
      const data = await res.json();
      if (data.code === 200) setCalendarData(data.data);
    } catch (err) { console.error(err); }
  };

  const handleZakatCalc = (e) => {
    e.preventDefault();
    const amount = parseFloat(zakatAmount);
    const nisab = goldPrice * 85; // نصاب الذهب (85 جرام عيار 24)
    if (amount >= nisab) {
      setZakatResult({
        isEligible: true,
        zakat: (amount * 0.025).toFixed(2),
        nisab: nisab.toLocaleString()
      });
    } else {
      setZakatResult({
        isEligible: false,
        nisab: nisab.toLocaleString()
      });
    }
  };

  const prayers = [
    { id: 'Fajr', name: 'الفجر', icon: '🌅' },
    { id: 'Sunrise', name: 'الشروق', icon: '🌄' },
    { id: 'Dhuhr', name: 'الظهر', icon: '☀️' },
    { id: 'Asr', name: 'العصر', icon: '🌤️' },
    { id: 'Maghrib', name: 'المغرب', icon: '🌇' },
    { id: 'Isha', name: 'العشاء', icon: '🌙' },
  ];

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary-blue)' }}>خدمات الخطيب</h1>
        <p style={{ color: 'var(--text-muted)' }}>مجموعة من الأدوات الشرعية والخدمية لمساعدة الخطيب والداعية</p>
      </header>

      {/* شريط الخدمات Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <button onClick={() => setActiveTab('prayers')} className={`btn ${activeTab === 'prayers' ? 'btn-primary' : 'btn-outline'}`}>⌚ أوقات الصلاة</button>
        <button onClick={() => setActiveTab('zakat')} className={`btn ${activeTab === 'zakat' ? 'btn-primary' : 'btn-outline'}`}>💰 مقدار الزكاة</button>
        <button onClick={() => setActiveTab('hijri')} className={`btn ${activeTab === 'hijri' ? 'btn-primary' : 'btn-outline'}`}>📅 التقويم الهجري</button>
        <button onClick={() => setActiveTab('occasions')} className={`btn ${activeTab === 'occasions' ? 'btn-primary' : 'btn-outline'}`}>🕌 مناسبات دينية</button>
      </div>

      <div className="animate-fade-in">
        
        {/* TAB 1: أوقات الصلاة */}
        {activeTab === 'prayers' && (
          <div>
            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto 2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
               <select value={country} onChange={(e) => {setCountry(e.target.value); fetchPrayerTimes(locationData[e.target.value].cities[0], e.target.value);}} style={{ padding: '0.5rem', borderRadius: '4px' }}>
                 {Object.keys(locationData).map(c => <option key={c} value={c}>{locationData[c].nameAr}</option>)}
               </select>
               <select value={city} onChange={(e) => {setCity(e.target.value); fetchPrayerTimes(e.target.value, country);}} style={{ padding: '0.5rem', borderRadius: '4px' }}>
                 {locationData[country].cities.map(cty => <option key={cty} value={cty}>{cty}</option>)}
               </select>
            </div>

            {loading ? <p style={{textAlign:'center'}}>جاري التحميل...</p> : prayerData && (
              <div className="grid-3">
                {prayers.map(p => (
                  <div key={p.id} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>{p.icon}</div>
                    <h3>{p.name}</h3>
                    <div style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>{prayerData.timings[p.id]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: مقدار الزكاة */}
        {activeTab === 'zakat' && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>حاسبة الزكاة</h2>
            <p style={{ marginBottom: '2rem' }}>أدخل إجمالي المبلغ النقدي المدخر الذي حال عليه الحول (سنة هجرية كاملة).</p>
            <form onSubmit={handleZakatCalc}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>المبلغ النقدي (بالعملة المحلية)</label>
              <input type="number" value={zakatAmount} onChange={(e)=>setZakatAmount(e.target.value)} style={{ width: '100%', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="مثال: 50000" required />
              
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>سعر جرام الذهب اليوم (عيار 24)</label>
              <input type="number" value={goldPrice} onChange={(e)=>setGoldPrice(e.target.value)} style={{ width: '100%', padding: '1rem', marginBottom: '2rem', borderRadius: '4px', border: '1px solid #ddd' }} />
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>احسب الزكاة</button>
            </form>

            {zakatResult && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: zakatResult.isEligible ? '#f0fff4' : '#fff5f5', borderRadius: '8px' }}>
                {zakatResult.isEligible ? (
                  <>
                    <h3 style={{ color: 'var(--primary-green)' }}>تجب عليك الزكاة!</h3>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>المقدار المستحق: {zakatResult.zakat}</p>
                    <p style={{fontSize: '0.85rem'}}>نصاب الزكاة الحالي تقريباً: {zakatResult.nisab}</p>
                  </>
                ) : (
                  <p>المبلغ لم يبلغ النصاب ({zakatResult.nisab}). لا تجب عليك الزكاة في هذا المبلغ.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: التقويم الهجري */}
        {activeTab === 'hijri' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
             <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>التقويم الهجري لشهر {currentTime.toLocaleDateString('ar-SA', {month: 'long'})}</h2>
             {prayerData && (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '12px' }}>
                   <div style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', marginBottom: '1rem' }}>{prayerData.date.hijri.weekday.ar}</div>
                   <div style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{prayerData.date.hijri.day}</div>
                   <div style={{ fontSize: '2rem' }}>{prayerData.date.hijri.month.ar} {prayerData.date.hijri.year} هـ</div>
                   <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>الموافق: {prayerData.date.readable} م</div>
                </div>
             )}
          </div>
        )}

        {/* TAB 4: مناسبات دينية */}
        {activeTab === 'occasions' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
             <h2 style={{ marginBottom: '2rem' }}>المناسبات الدينية القادمة</h2>
             {calendarData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {calendarData.slice(0, 30).map((day, i) => {
                      const hol = day.date.hijri.holidays;
                      if (hol.length > 0) {
                         return (
                            <div key={i} style={{ padding: '1rem', borderRight: '4px solid var(--accent-gold)', background: 'rgba(200,168,92,0.1)', borderRadius: '4px' }}>
                               <strong>{hol.join(', ')}</strong>
                               <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{day.date.hijri.day} {day.date.hijri.month.ar} {day.date.hijri.year} هـ</div>
                            </div>
                         );
                      }
                      return null;
                   })}
                   <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>يتم عرض المناسبات بناءً على التقويم الفلكي.</p>
                </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}
