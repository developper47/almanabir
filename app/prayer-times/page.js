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

  const fetchPrayerTimes = async (searchCity, searchCountry) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(searchCity)}&country=${encodeURIComponent(searchCountry)}&method=4`);
      
      if (!res.ok) {
        throw new Error('فشل جلب الأوقات. يرجى المحاولة لاحقاً.');
      }

      const data = await res.json();
      setPrayerData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes(city, country);
  }, []);

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    // تحديث المدينة تلقائيا لأول مدينة في الدولة
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
        <p style={{ color: 'var(--text-muted)' }}>مواقيت الصلاة الدقيقة لأشهر المدن العربية</p>
      </div>

      {/* حقول البحث بالقائمة المنسدلة */}
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto 3rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
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
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-green)' }}>
              {prayerData.date.hijri.weekday.ar} - {prayerData.date.hijri.day} {prayerData.date.hijri.month.ar} {prayerData.date.hijri.year} هـ
            </p>
          </div>

          <div className="grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {prayers.map(prayer => (
              <div key={prayer.id} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>{prayer.icon}</div>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{prayer.name}</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {prayerData.timings[prayer.id]}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
