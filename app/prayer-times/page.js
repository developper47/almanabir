"use client";

import { useState, useEffect } from 'react';

// قاموس الدول والمدن لسحب مواقيت الصلاة (تونس كبلد افتراضي مع مدنها الـ 24)
const locationData = {
  "Tunisia": {
    nameAr: "تونس",
    method: 18, // الطريقة الرسمية المعتمدة لدى وزارة الشؤون الدينية التونسية
    cities: [
      { en: "Tunis", ar: "تونس العاصمة" },
      { en: "Sfax", ar: "صفاقس" },
      { en: "Sousse", ar: "سوسة" },
      { en: "Kairouan", ar: "القيروان" },
      { en: "Bizerte", ar: "بنزرت" },
      { en: "Gabes", ar: "قابس" },
      { en: "Ariana", ar: "أريانة" },
      { en: "Ben Arous", ar: "بن عروس" },
      { en: "Monastir", ar: "المنستير" },
      { en: "Nabeul", ar: "نابل" },
      { en: "Gafsa", ar: "قفصة" },
      { en: "Medenine", ar: "مدنين" },
      { en: "Beja", ar: "باجة" },
      { en: "Jendouba", ar: "جندوبة" },
      { en: "Mahdia", ar: "المهدية" },
      { en: "Kasserine", ar: "القصرين" },
      { en: "Sidi Bouzid", ar: "سيدي بوزيد" },
      { en: "Tataouine", ar: "تطاوين" },
      { en: "Tozeur", ar: "توزر" },
      { en: "Kebili", ar: "قبلي" },
      { en: "Siliana", ar: "سليانة" },
      { en: "Zaghouan", ar: "زغوان" },
      { en: "Manouba", ar: "منوبة" },
      { en: "El Kef", ar: "الكاف" }
    ]
  },
  "Saudi Arabia": {
    nameAr: "السعودية",
    method: 4, // جامعة أم القرى
    cities: [
      { en: "Mecca", ar: "مكة المكرمة" },
      { en: "Medina", ar: "المدينة المنورة" },
      { en: "Riyadh", ar: "الرياض" },
      { en: "Jeddah", ar: "جدة" },
      { en: "Dammam", ar: "الدمام" }
    ]
  },
  "Algeria": {
    nameAr: "الجزائر",
    method: 19, // الجزائر
    cities: [
      { en: "Algiers", ar: "الجزائر العاصمة" },
      { en: "Oran", ar: "وهران" },
      { en: "Constantine", ar: "قسنطينة" },
      { en: "Annaba", ar: "عنابة" },
      { en: "Batna", ar: "باتنة" }
    ]
  },
  "Morocco": {
    nameAr: "المغرب",
    method: 21, // المغرب
    cities: [
      { en: "Rabat", ar: "الرباط" },
      { en: "Casablanca", ar: "الدار البيضاء" },
      { en: "Fes", ar: "فاس" },
      { en: "Marrakesh", ar: "مراكش" },
      { en: "Tangier", ar: "طنجة" }
    ]
  },
  "Egypt": {
    nameAr: "مصر",
    method: 5, // الهيئة المصرية العامة للمساحة
    cities: [
      { en: "Cairo", ar: "القاهرة" },
      { en: "Alexandria", ar: "الإسكندرية" },
      { en: "Giza", ar: "الجيزة" },
      { en: "Luxor", ar: "الأقصر" },
      { en: "Aswan", ar: "أسوان" }
    ]
  },
  "United Arab Emirates": {
    nameAr: "الإمارات",
    method: 16, // دبي
    cities: [
      { en: "Abu Dhabi", ar: "أبوظبي" },
      { en: "Dubai", ar: "دبي" },
      { en: "Sharjah", ar: "الشارقة" },
      { en: "Al Ain", ar: "العين" },
      { en: "Ajman", ar: "عجمان" }
    ]
  }
};

// قاموس ترجمة المناسبات الدينية من الإنجليزية إلى العربية
const holidayTranslations = {
  'Lailat-ul-Qadr': 'ليلة القدر المباركة',
  'Laylat al-Qadr': 'ليلة القدر المباركة',
  'Eid-ul-Fitr': 'عيد الفطر المبارك',
  'Eid al-Fitr': 'عيد الفطر المبارك',
  'Eid-ul-Adha': 'عيد الأضحى المبارك',
  'Eid al-Adha': 'عيد الأضحى المبارك',
  'Arafa': 'يوم عرفة المبارك',
  'Arafat': 'يوم عرفة المبارك',
  'Day of Arafah': 'يوم عرفة المبارك',
  'Islamic New Year': 'رأس السنة الهجرية',
  '1st of Muharram': 'فاتح محرم - رأس السنة الهجرية',
  'Ashura': 'يوم عاشوراء',
  'Mawlid an-Nabi': 'ذكرى المولد النبوي الشريف',
  'Mawlid': 'ذكرى المولد النبوي الشريف',
  'Milad un Nabi': 'ذكرى المولد النبوي الشريف',
  'Isra and Miraj': 'ذكرى الإسراء والمعراج',
  'Lailat al-Miraj': 'ليلة الإسراء والمعراج',
  'Mid-Sha\'ban': 'ليلة النصف من شعبان',
  'Shab-e-Barat': 'ليلة النصف من شعبان',
  '1st of Ramadan': 'أول أيام شهر رمضان المبارك',
  'Beginning of Ramadan': 'غرة شهر رمضان المبارك'
};

function translateHoliday(text) {
  if (!text) return '';
  for (const [en, ar] of Object.entries(holidayTranslations)) {
    if (text.toLowerCase().includes(en.toLowerCase())) {
      return ar;
    }
  }
  return text;
}

// قائمة المناسبات الدينية الثابتة في السنة الهجرية
const islamicAnnualOccasions = [
  {
    title: "رأس السنة الهجرية",
    hijriDate: "1 محرم",
    month: 1,
    day: 1,
    desc: "غرة العام الهجري الجديد واستحضار هجرة النبي المصطفى ﷺ من مكة إلى المدينة المنورة وتأسيس الدولة الإسلامية."
  },
  {
    title: "يوم عاشوراء",
    hijriDate: "10 محرم",
    month: 1,
    day: 10,
    desc: "اليوم المبارك الذي نجى الله فيه نبيه موسى عليه السلام وقومه من فرعون، ويسن صيامه وصيام يوم قبله أو بعده."
  },
  {
    title: "ذكرى المولد النبوي الشريف",
    hijriDate: "12 ربيع الأول",
    month: 3,
    day: 12,
    desc: "مولد خاتم الأنبياء والمرسلين وسيد الخلق أجمعين محمد صلى الله عليه وسلم، رحمة للعالمين."
  },
  {
    title: "ذكرى الإسراء والمعراج",
    hijriDate: "27 رجب",
    month: 7,
    day: 27,
    desc: "معجزة إسراء النبي ﷺ من المسجد الحرام إلى المسجد الأقصى وعروجه إلى السماوات العلى، وفرض الصلوات الخمس."
  },
  {
    title: "ليلة النصف من شعبان",
    hijriDate: "15 شعبان",
    month: 8,
    day: 15,
    desc: "ليلة مباركة فاضلة يستحب فيها الإكثار من الطاعات والدعاء والاستغفار، وفيها كان تحويل القبلة إلى الكعبة المشرفة."
  },
  {
    title: "غرة شهر رمضان المبارك",
    hijriDate: "1 رمضان",
    month: 9,
    day: 1,
    desc: "بداية شهر الصيام والقرآن، شهر الرحمة والمغفرة والعتق من النار، وتفتح فيه أبواب الجنان."
  },
  {
    title: "ذكرى غزوة بدر الكبرى",
    hijriDate: "17 رمضان",
    month: 9,
    day: 17,
    desc: "يوم الفرقان الأول بين الحق والباطل، وأول انتصار عظيم للمسلمين بقيادة النبي صلى الله عليه وسلم."
  },
  {
    title: "ذكرى فتح مكة الأعظم",
    hijriDate: "20 رمضان",
    month: 9,
    day: 20,
    desc: "النصر المبين ودخول المسلمين مكة فاتحين وتطهير الكعبة المشرفة من الأصنام، وإعلان العفو العام."
  },
  {
    title: "ليلة القدر المباركة",
    hijriDate: "العشر الأواخر من رمضان (ليلة 27)",
    month: 9,
    day: 27,
    desc: "ليلة نزول القرآن الكريم، وهي خير من ألف شهر، تتنزل فيها الملائكة بالسلام والبركة حتى مطلع الفجر."
  },
  {
    title: "عيد الفطر المبارك",
    hijriDate: "1 شوال",
    month: 10,
    day: 1,
    desc: "يوم الجائزة والشكر لله تعالى على إتمام فريضة الصيام، وفرحة المسلمين بصلاتهم وزكاة فطرهم."
  },
  {
    title: "يوم عرفة المبارك",
    hijriDate: "9 ذو الحجة",
    month: 12,
    day: 9,
    desc: "ركن الحج الأعظم وخير يوم طلعت عليه الشمس، يستحب صيامه لغير الحاج ويكفر ذنوب سنتين."
  },
  {
    title: "عيد الأضحى المبارك",
    hijriDate: "10 ذو الحجة",
    month: 12,
    day: 10,
    desc: "يوم الحج الأكبر وأداء النحر والتكبير، إحياءً لسنة أبي الأنبياء إبراهيم عليه السلام."
  },
  {
    title: "أيام التشريق المباركة",
    hijriDate: "11 - 13 ذو الحجة",
    month: 12,
    day: 11,
    desc: "أيام ذكر لله تعالى وأكل وشرب، واستكمال مناسك الحج برمي الجمرات في منى."
  }
];

const gregorianMonthNamesAr = [
  "جانفي (يناير)", "فيفري (فبراير)", "مارس", "أفريل (أبريل)", "ماي (مايو)", "جوان (يونيو)",
  "جويلية (يوليو)", "أوت (أغسطس)", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const weekDayNamesAr = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

const weekdayToColIndex = {
  "Sunday": 0,
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6
};

export default function KhatibServices() {
  const [activeTab, setActiveTab] = useState('prayers');
  
  // شؤون مواقيت الصلاة (تونس هي البلد الافتراضي مع تونس العاصمة)
  const [country, setCountry] = useState('Tunisia');
  const [city, setCity] = useState('Tunis');
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // شؤون اليومية الشهرية والتنقل بين الأشهر
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-12
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  const [calLoading, setCalLoading] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  // شؤون الزكاة
  const [zakatAmount, setZakatAmount] = useState('');
  const [goldPrice, setGoldPrice] = useState(240); // دينار تونسي لجرام الذهب عيار 24 تقريبياً
  const [zakatResult, setZakatResult] = useState(null);

  useEffect(() => {
    fetchPrayerTimes(city, country);
    fetchMonthlyCalendar(city, country, calMonth, calYear);
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getMethodForCountry = (cntry) => {
    return locationData[cntry]?.method || 18;
  };

  const fetchPrayerTimes = async (sCity, sCountry) => {
    setLoading(true);
    try {
      const method = getMethodForCountry(sCountry);
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(sCity)}&country=${encodeURIComponent(sCountry)}&method=${method}`);
      const data = await res.json();
      if (data.code === 200) {
        setPrayerData(data.data);
      }
    } catch (err) {
      console.error("Error fetching prayer times:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyCalendar = async (sCity, sCountry, month, year) => {
    setCalLoading(true);
    try {
      const method = getMethodForCountry(sCountry);
      const res = await fetch(`https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(sCity)}&country=${encodeURIComponent(sCountry)}&method=${method}&month=${month}&year=${year}`);
      const data = await res.json();
      if (data.code === 200 && Array.isArray(data.data)) {
        setCalendarDays(data.data);
      }
    } catch (err) {
      console.error("Error fetching monthly calendar:", err);
    } finally {
      setCalLoading(false);
    }
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    const firstCity = locationData[newCountry]?.cities[0]?.en || 'Tunis';
    setCity(firstCity);
    fetchPrayerTimes(firstCity, newCountry);
    fetchMonthlyCalendar(firstCity, newCountry, calMonth, calYear);
  };

  const handleCityChange = (newCity) => {
    setCity(newCity);
    fetchPrayerTimes(newCity, country);
    fetchMonthlyCalendar(newCity, country, calMonth, calYear);
  };

  const handlePrevMonth = () => {
    let newM = calMonth - 1;
    let newY = calYear;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setCalMonth(newM);
    setCalYear(newY);
    fetchMonthlyCalendar(city, country, newM, newY);
  };

  const handleNextMonth = () => {
    let newM = calMonth + 1;
    let newY = calYear;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setCalMonth(newM);
    setCalYear(newY);
    fetchMonthlyCalendar(city, country, newM, newY);
  };

  const handleResetToCurrentMonth = () => {
    const curM = today.getMonth() + 1;
    const curY = today.getFullYear();
    setCalMonth(curM);
    setCalYear(curY);
    fetchMonthlyCalendar(city, country, curM, curY);
  };

  const handleZakatCalc = (e) => {
    e.preventDefault();
    const amount = parseFloat(zakatAmount);
    const nisab = goldPrice * 85; // نصاب الذهب (85 غرام عيار 24)
    if (amount >= nisab) {
      setZakatResult({
        isEligible: true,
        zakat: (amount * 0.025).toLocaleString('ar-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        nisab: nisab.toLocaleString('ar-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      });
    } else {
      setZakatResult({
        isEligible: false,
        nisab: nisab.toLocaleString('ar-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

  // إعداد شبكة اليومية الشهرية (التقويم الميلادي والهجري معاً)
  const firstDayObj = calendarDays.length > 0 ? calendarDays[0] : null;
  const firstDayWeekdayEn = firstDayObj?.date?.gregorian?.weekday?.en || "Sunday";
  const startEmptyCells = weekdayToColIndex[firstDayWeekdayEn] || 0;

  // اليوم الحالي للمقارنة
  const currentDayStr = String(today.getDate()).padStart(2, '0');
  const isCurrentMonthViewing = (calMonth === (today.getMonth() + 1)) && (calYear === today.getFullYear());

  // استخراج اسم الشهر الهجري المعروض
  const hijriMonthNameDisplayed = firstDayObj?.date?.hijri?.month?.ar || "الشهر الهجري";
  const hijriYearDisplayed = firstDayObj?.date?.hijri?.year || "";

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary-blue)' }}>خدمات الخطيب</h1>
        <p style={{ color: 'var(--text-muted)' }}>مجموعة من الأدوات الشرعية والخدمية المعتمدة لمساعدة الخطيب والإمام والداعية</p>
      </header>

      {/* شريط الخدمات Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <button onClick={() => setActiveTab('prayers')} className={`btn ${activeTab === 'prayers' ? 'btn-primary' : 'btn-outline'}`}>⌚ أوقات الصلاة</button>
        <button onClick={() => setActiveTab('hijri')} className={`btn ${activeTab === 'hijri' ? 'btn-primary' : 'btn-outline'}`}>📅 اليومية والتقويم الهجري</button>
        <button onClick={() => setActiveTab('occasions')} className={`btn ${activeTab === 'occasions' ? 'btn-primary' : 'btn-outline'}`}>🕌 المناسبات الدينية</button>
        <button onClick={() => setActiveTab('zakat')} className={`btn ${activeTab === 'zakat' ? 'btn-primary' : 'btn-outline'}`}>💰 حاسبة الزكاة</button>
      </div>

      <div className="animate-fade-in">
        
        {/* TAB 1: أوقات الصلاة */}
        {activeTab === 'prayers' && (
          <div>
            <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto 2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>الدولة:</label>
                <select 
                  value={country} 
                  onChange={(e) => handleCountryChange(e.target.value)} 
                  style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white' }}
                >
                  {Object.keys(locationData).map(c => (
                    <option key={c} value={c}>{locationData[c].nameAr}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>المدينة / الولاية:</label>
                <select 
                  value={city} 
                  onChange={(e) => handleCityChange(e.target.value)} 
                  style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white' }}
                >
                  {locationData[country]?.cities.map(cty => (
                    <option key={cty.en} value={cty.en}>{cty.ar}</option>
                  ))}
                </select>
              </div>

              {country === 'Tunisia' && (
                <span className="badge" style={{ background: '#e6fffa', color: 'var(--primary-green)', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
                  ✓ معتمدة بوزارة الشؤون الدينية التونسية (18°)
                </span>
              )}
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '3rem' }}>جاري تحميل مواقيت الصلاة الدقيقة...</p>
            ) : prayerData && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                  <span>📅 اليوم: <strong>{prayerData.date.hijri.weekday.ar}</strong> {prayerData.date.hijri.day} {prayerData.date.hijri.month.ar} {prayerData.date.hijri.year} هـ</span>
                  <span style={{ margin: '0 1rem' }}>|</span>
                  <span>الموافق لـ: <strong>{prayerData.date.readable} م</strong></span>
                </div>

                <div className="grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
                  {prayers.map(p => (
                    <div key={p.id} className="card" style={{ textAlign: 'center', padding: '1.8rem 1.5rem', borderTop: p.id === 'Dhuhr' ? '3px solid var(--accent-gold)' : 'none' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                      <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>{p.name}</h3>
                      <div style={{ fontSize: '1.8rem', color: 'var(--primary-green)', fontWeight: 'bold', direction: 'ltr' }}>
                        {prayerData.timings[p.id]}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  🕌 الحساب الدقيق معتمد على خطوط الطول والعرض للجهة المختارة (طريقة {locationData[country]?.nameAr || 'الجمهورية التونسية'}).
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: التقويم واليومية الشهرية */}
        {activeTab === 'hijri' && (
          <div>
            {/* رأس التنقل بين الأشهر */}
            <div className="card" style={{ maxWidth: '1000px', margin: '0 auto 2rem', padding: '1.5rem' }}>
              <div className="flex-between stack-mobile" style={{ alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={handlePrevMonth} 
                    className="btn btn-outline" 
                    title="الشهر السابق"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>→</span> الشهر السابق
                  </button>
                  <button 
                    onClick={handleResetToCurrentMonth} 
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
                  >
                    اليوم الحالي
                  </button>
                  <button 
                    onClick={handleNextMonth} 
                    className="btn btn-outline" 
                    title="الشهر القادم"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    الشهر القادم <span>←</span>
                  </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ margin: 0, color: 'var(--primary-blue)', fontSize: '1.4rem' }}>
                    {gregorianMonthNamesAr[calMonth - 1]} {calYear} م
                  </h2>
                  <p style={{ margin: '0.3rem 0 0', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {hijriMonthNameDisplayed} {hijriYearDisplayed} هـ
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select 
                    value={city} 
                    onChange={(e) => handleCityChange(e.target.value)} 
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0', background: 'white', fontSize: '0.9rem' }}
                  >
                    {locationData[country]?.cities.map(cty => (
                      <option key={cty.en} value={cty.en}>{cty.ar}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* شبكة اليومية الشهرية */}
            <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', overflow: 'hidden' }}>
              {calLoading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>جاري تحميل يومية الشهر...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: '700px' }}>
                    {/* ترويسة أيام الأسبوع */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--primary-blue)', color: 'white', textAlign: 'center', fontWeight: 'bold', padding: '0.8rem 0' }}>
                      {weekDayNamesAr.map((wName, idx) => (
                        <div key={wName} style={{ color: idx === 5 ? 'var(--accent-gold)' : 'white' }}>
                          {wName} {idx === 5 && '🕌'}
                        </div>
                      ))}
                    </div>

                    {/* خلايا أيام الشهر */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#e2e8f0', gap: '1px' }}>
                      {/* خلايا فارغة في بداية الشهر للمحاذاة */}
                      {Array.from({ length: startEmptyCells }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ background: '#f8f9fa', minHeight: '100px', opacity: 0.5 }}></div>
                      ))}

                      {/* أيام الشهر */}
                      {calendarDays.map((dayItem) => {
                        const gDay = dayItem.date.gregorian.day;
                        const hDay = dayItem.date.hijri.day;
                        const hMonthAr = dayItem.date.hijri.month.ar;
                        const isFriday = dayItem.date.gregorian.weekday.en === 'Friday';
                        const isToday = isCurrentMonthViewing && (String(gDay).padStart(2, '0') === currentDayStr);
                        const hasHoliday = dayItem.date.hijri.holidays && dayItem.date.hijri.holidays.length > 0;
                        const holidayNameAr = hasHoliday ? translateHoliday(dayItem.date.hijri.holidays[0]) : '';

                        return (
                          <div 
                            key={dayItem.date.gregorian.date}
                            onClick={() => setSelectedDayInfo(dayItem)}
                            style={{
                              background: isToday ? '#e6fffa' : (isFriday ? '#fffdf5' : 'white'),
                              minHeight: '110px',
                              padding: '0.6rem',
                              position: 'relative',
                              cursor: 'pointer',
                              border: isToday ? '2px solid var(--primary-green)' : 'none',
                              boxShadow: isToday ? '0 0 10px rgba(47,133,90,0.3) inset' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'transform 0.15s, background 0.15s'
                            }}
                            title="اضغط لعرض مواقيت هذا اليوم"
                          >
                            <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                              <span style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold', 
                                color: isToday ? 'var(--primary-green)' : (isFriday ? '#b7791f' : 'var(--text-main)')
                              }}>
                                {parseInt(gDay, 10)}
                              </span>

                              {isToday && (
                                <span style={{ 
                                  background: 'var(--primary-green)', 
                                  color: 'white', 
                                  fontSize: '0.65rem', 
                                  padding: '0.15rem 0.4rem', 
                                  borderRadius: '4px',
                                  fontWeight: 'bold'
                                }}>
                                  اليوم
                                </span>
                              )}
                            </div>

                            {/* التاريخ الهجري */}
                            <div style={{ textAlign: 'center', margin: '0.4rem 0' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                                {hDay}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {hMonthAr}
                              </div>
                            </div>

                            {/* مناسبة دينية إن وجدت */}
                            {hasHoliday && (
                              <div style={{ 
                                background: '#fefcbf', 
                                color: '#744210', 
                                fontSize: '0.65rem', 
                                padding: '0.2rem', 
                                borderRadius: '4px', 
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: 'bold'
                              }}>
                                🕌 {holidayNameAr}
                              </div>
                            )}

                            {isFriday && !hasHoliday && (
                              <div style={{ fontSize: '0.65rem', color: '#b7791f', textAlign: 'center' }}>
                                جمعة مباركة
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* تفاصيل اليوم المختار عند النقر */}
            {selectedDayInfo && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
              }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
                  <div className="flex-between" style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>
                        {selectedDayInfo.date.hijri.weekday.ar} {selectedDayInfo.date.gregorian.day} {gregorianMonthNamesAr[parseInt(selectedDayInfo.date.gregorian.month.number, 10) - 1]}
                      </h3>
                      <p style={{ margin: '0.3rem 0 0', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        الموافق: {selectedDayInfo.date.hijri.day} {selectedDayInfo.date.hijri.month.ar} {selectedDayInfo.date.hijri.year} هـ
                      </p>
                    </div>
                    <button onClick={() => setSelectedDayInfo(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                  </div>

                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>مواقيت الصلاة لهذا اليوم ({city}):</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>🌅 الفجر: <strong>{selectedDayInfo.timings.Fajr}</strong></div>
                    <div style={{ padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>🌄 الشروق: <strong>{selectedDayInfo.timings.Sunrise}</strong></div>
                    <div style={{ padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>☀️ الظهر: <strong>{selectedDayInfo.timings.Dhuhr}</strong></div>
                    <div style={{ padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>🌤️ العصر: <strong>{selectedDayInfo.timings.Asr}</strong></div>
                    <div style={{ padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>🌇 المغرب: <strong>{selectedDayInfo.timings.Maghrib}</strong></div>
                    <div style={{ padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)' }}>🌙 العشاء: <strong>{selectedDayInfo.timings.Isha}</strong></div>
                  </div>

                  <button onClick={() => setSelectedDayInfo(null)} className="btn btn-primary" style={{ width: '100%' }}>
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: المناسبات الدينية القادمة (كاملة باللغة العربية) */}
        {activeTab === 'occasions' && (
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(47,133,90,0.08) 0%, rgba(200,168,92,0.08) 100%)' }}>
              <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>المناسبات والأعياد الدينية في السنة الهجرية</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                دليل كامل للخطباء والأئمة بأبرز محطات ومواسم الخير والعبادة في التقويم الإسلامي
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {islamicAnnualOccasions.map((occ, idx) => (
                <div 
                  key={idx} 
                  className="card"
                  style={{ 
                    padding: '1.5rem 2rem', 
                    borderRight: '5px solid var(--accent-gold)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div className="flex-between stack-mobile" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '1.8rem' }}>🕌</span>
                      <div>
                        <h3 style={{ margin: 0, color: 'var(--primary-blue)', fontSize: '1.25rem' }}>{occ.title}</h3>
                        <span style={{ color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          📅 {occ.hijriDate}
                        </span>
                      </div>
                    </div>
                    <span className="badge" style={{ background: '#f7fafc', color: 'var(--text-muted)', border: '1px solid #edf2f7' }}>
                      مناسبة إسلامية سنوية
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.8', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
                    {occ.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: مقدار الزكاة */}
        {activeTab === 'zakat' && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' }}>حاسبة الزكاة الشرعية</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              احسب مقدار زكاة المال الواجبة شرعاً (2.5%) إذا بلغ المال المدخر النصاب وحال عليه الحول الهجري.
            </p>
            
            <form onSubmit={handleZakatCalc}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  المبلغ النقدي المدخر (بالدينار التونسي / العملة المحلية)
                </label>
                <input 
                  type="number" 
                  value={zakatAmount} 
                  onChange={(e) => setZakatAmount(e.target.value)} 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0' }} 
                  placeholder="مثال: 25000" 
                  required 
                  min="0"
                  step="any"
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  سعر غرام الذهب عيار 24 اليوم (تقريبياً بالعملة المحلية)
                </label>
                <input 
                  type="number" 
                  value={goldPrice} 
                  onChange={(e) => setGoldPrice(e.target.value)} 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e0' }} 
                  required
                  min="1"
                  step="any"
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  * النصاب الشرعي يعادل قيمة 85 غراماً من الذهب الخالص عيار 24.
                </span>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                احسب مقدار الزكاة الآن
              </button>
            </form>

            {zakatResult && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: zakatResult.isEligible ? '#f0fff4' : '#fff5f5', borderRadius: 'var(--radius-md)', border: `1px solid ${zakatResult.isEligible ? '#c6f6d5' : '#fed7d7'}` }}>
                {zakatResult.isEligible ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                    <h3 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>بلغ المال النصاب وتجب فيه الزكاة</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-blue)', margin: '0.8rem 0' }}>
                      المقدار الواجب إخراجه: {zakatResult.zakat}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      قيمة النصاب المعتمد (85 غرام ذهب): {zakatResult.nisab}
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#c53030', marginBottom: '0.5rem' }}>المبلغ لم يبلغ النصاب الشرعي</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                      نصاب الزكاة الحالي هو: <strong>{zakatResult.nisab}</strong>. لا تجب الزكاة في هذا المبلغ حتى يبلغ النصاب ويحول عليه الحول.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
