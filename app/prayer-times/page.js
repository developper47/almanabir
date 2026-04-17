"use client";

import { useState, useEffect } from 'react';

// قاموس الدول والمدن
const locationData = {
  "Saudi Arabia": { nameAr: "السعودية", cities: ["Mecca", "Medina", "Riyadh", "Jeddah", "Dammam"] },
  "Egypt": { nameAr: "مصر", cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"] },
  "Algeria": { nameAr: "الجزائر", cities: ["Algiers", "Oran", "Constantine", "Annaba", "Batna"] },
  "Morocco": { nameAr: "المغرب", cities: ["Casablanca", "Rabat", "Marrakesh", "Fes", "Tangier"] },
  "Tunisia": { nameAr: "تونس", cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"] },
  "United Arab Emirates": { nameAr: "الإمارات", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman"] },
  "Jordan": { nameAr: "الأردن", cities: ["Amman", "Zarqa", "Irbid", "Aqaba", "Madaba"] },
  "Kuwait": { nameAr: "الكويت", cities: ["Kuwait City", "Al Ahmadi", "Hawalli", "Salmiya", "Jahra"] },
  "Qatar": { nameAr: "قطر", cities: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Umm Salal"] },
  "Oman": { nameAr: "عُمان", cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"] }
};

export default function PrayerTimes() {
  const [country, setCountry] = useState('Saudi Arabia');
  const [city, setCity] = useState('Mecca');
  
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayerInfo, setNextPrayerInfo] = useState(null);

  useEffect(() => {
    // محاولة تحديد الموقع تلقائياً
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimesByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // في حال الرفض أو الفشل، نستخدم القيم الافتراضية
          fetchPrayerTimes(city, country);
        }
      );
    } else {
      fetchPrayerTimes(city, country);
    }

    // تحديث الوقت كل ثانية للعداد التنازلي
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerData) {
      calculateNextPrayer();
    }
  }, [prayerData, currentTime]);

  const fetchPrayerTimes = async (searchCity, searchCountry) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(searchCity)}&country=${encodeURIComponent(searchCountry)}&method=4`);
      const data = await res.json();
      if (data.success || data.code === 200) {
        setPrayerData(data.data);
      } else {
        throw new Error('فشل جلب الأوقات');
      }
    } catch (err) {
      setError('فشل جلب الأوقات. يرجى اختيار الموقع يدوياً.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerTimesByCoords = async (lat, lng) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`);
      const data = await res.json();
      if (data.code === 200) {
        setPrayerData(data.data);
        setError('');
      }
    } catch (err) {
      setError('فشل تحديد الموقع التلقائي.');
      fetchPrayerTimes(city, country);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = () => {
    if (!prayerData) return;

    const timings = prayerData.timings;
    const now = currentTime;
    
    const prayerList = [
      { name: 'Fajr', label: 'الفجر' },
      { name: 'Dhuhr', label: 'الظهر' },
      { name: 'Asr', label: 'العصر' },
      { name: 'Maghrib', label: 'المغرب' },
      { name: 'Isha', label: 'العشاء' }
    ];

    let next = null;
    let minDiff = Infinity;

    prayerList.forEach(p => {
      const [hours, minutes] = timings[p.name].split(':');
      const pDate = new Date(now);
      pDate.setHours(parseInt(hours), parseInt(minutes), 0);

      let diff = pDate - now;
      if (diff < 0) {
        // الصلاة في اليوم التالي
        pDate.setDate(pDate.getDate() + 1);
        diff = pDate - now;
      }

      if (diff < minDiff) {
        minDiff = diff;
        next = { ...p, time: timings[p.name], diff };
      }
    });

    setNextPrayerInfo(next);
  };

  const formatTimeDiff = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    const firstCity = locationData[selectedCountry].cities[0];
    setCity(firstCity);
    fetchPrayerTimes(firstCity, selectedCountry);
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    fetchPrayerTimes(selectedCity, country);
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
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>أوقات الصلاة</h1>
        <p style={{ color: 'var(--text-muted)' }}>مواقيت الصلاة الدقيقة بناءً على موقعك الحالي</p>
      </div>

      {nextPrayerInfo && (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto 3rem', padding: '2rem', textAlign: 'center', border: '2px solid var(--primary-green)' }}>
          <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>الصلاة القادمة: {nextPrayerInfo.label}</h2>
          <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--primary-blue)' }}>
            {formatTimeDiff(nextPrayerInfo.diff)}
          </div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>متبقي على صلاة {nextPrayerInfo.label} ({nextPrayerInfo.time})</p>
        </div>
      )}

      {/* حقول البحث بالقائمة المنسدلة */}
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto 3rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <p style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>أو اختر المدينة يدوياً:</p>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>الدولة</label>
          <select 
            value={country}
            onChange={handleCountryChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white' }}
          >
            {Object.keys(locationData).map(c => (
              <option key={c} value={c}>{locationData[c].nameAr} ({c})</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>المدينة</label>
          <select 
            value={city}
            onChange={handleCityChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white' }}
          >
            {locationData[country].cities.map(cty => (
              <option key={cty} value={cty}>{cty}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</div>}
      
      {error && <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>{error}</div>}

      {!loading && !error && prayerData && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>الموقع: {prayerData.meta.timezone}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-green)' }}>
              {prayerData.date.hijri.weekday.ar} - {prayerData.date.hijri.day} {prayerData.date.hijri.month.ar} {prayerData.date.hijri.year} هـ
            </p>
          </div>

          <div className="grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {prayers.map(prayer => {
              const IsNext = nextPrayerInfo && nextPrayerInfo.name === prayer.id;
              return (
                <div key={prayer.id} className="glass-panel" style={{ 
                  padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                  border: IsNext ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.2)',
                  transform: IsNext ? 'scale(1.05)' : 'none',
                  zIndex: IsNext ? 1 : 0
                }}>
                  <div style={{ fontSize: '3rem' }}>{prayer.icon}</div>
                  <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{prayer.name}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                    {prayerData.timings[prayer.id]}
                  </div>
                  {IsNext && <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.8rem' }}>الصلاة القادمة</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
