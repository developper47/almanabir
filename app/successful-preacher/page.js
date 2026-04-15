"use client";

import { useState } from 'react';

const adviceData = [
  {
    title: "الإخلاص والقدوة الحسنة",
    content: "إن أول أسرار النجاح في الخطابة هو الإخلاص لله عز وجل، وأن يكون الخطيب قدوة في عمله وسلوكه قبل قوله، فكلام الخارج من القلب يصل إلى القلب، والتزام الخطيب بما يدعو إليه يعطي لكلامه وزناً وهيبة في نفوس المصلين. الإخلاص هو الروح التي تحيي الكلمات وتجعلها تلامس شغاف القلوب، وبدونها يظل الكلام مجرد عبارات منمقة لا أثر لها."
  },
  {
    title: "الإعداد الجيد والتمكن العلمي",
    content: "التحضير الدقيق هو نصف الخطبة، ويجب على الخطيب التمكن من الموضوع علمياً، والاعتماد على الأدلة الصحيحة من الكتاب والسنة، وتنظيم الأفكار بترتيب منطقي يسهل على المستمع استيعابه والخروج بفائدة عملية. لا تكتفِ بالمعلومات السطحية، بل غص في أعماق المسألة لتتمكن من الإجابة على التساؤلات الذهنية التي قد تدور في خلد المصلين أثناء استماعهم لك."
  },
  {
    title: "مراعاة أحوال المستمعين",
    content: "الخطيب الناجح هو من يلامس واقع الناس وهمومهم، فيختار المواضيع المناسبة لزمانهم ومكانهم، ويستخدم لغة مفهومة تجمع بين الفصاحة والبساطة، مبتعداً عن الغموض أو التعقيد الذي قد يحول بين الناس وفهم الرسالة. إن مراعاة التنوع الثقافي والعمري للمصلين يتطلب ذكاءً في اختيار الألفاظ وضرب الأمثلة التوضيحية التي تقرب المعاني للجميع."
  },
  {
    title: "حسن الإلقاء والتواصل الفعال",
    content: "التدرب على مهارات الإلقاء الصوتي وتوزيع النظرات ولغة الجسد يزيد من تأثير الخطبة، فنبرة الصوت يجب أن تتغير حسب الموقف (ترغيباً أو ترهيباً)، مع الحفاظ على الثبات والوقار الذي يليق بمنبر رسول الله صلى الله عليه وسلم. التواصل البصري مع جميع زوايا المسجد يشعر كل مصلٍ بأنك تخاطبه هو شخصياً، مما يزيد من تركيزه وانتباهه لما تقول."
  },
  {
    title: "الالتزام بالوقت والتركيز الموضوعي",
    content: "خير الكلام ما قل ودل، ومن مهارة الخطيب أن يلتزم بالوقت المحدد للخطبة دون إطالة مملة تشتت المصلين، وأن يركز على فكرة محورية واحدة يعالجها من جوانبها المختلفة بدلاً من تشتيت المستمعين بمواضيع متعددة في وقت واحد. الإيجاز غير المخل هو دليل على تمكن الخطيب من أدواته واحترامه لوقت الناس الجالسين بين يديه."
  }
];

function AdviceCard({ title, content }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create a short preview of the text
  const preview = content.slice(0, 100) + "...";

  return (
    <div className="card" style={{ marginBottom: '1.5rem', transition: 'all 0.3s ease' }}>
      <div className="card-body" style={{ padding: '2rem' }}>
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem', borderRight: '4px solid var(--accent-gold)', paddingRight: '1rem' }}>
          {title}
        </h3>
        <p style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.05rem' }}>
          {isExpanded ? content : preview}
        </p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
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
