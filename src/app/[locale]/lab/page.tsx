import Link from 'next/link';

export const metadata = { title: 'Lab' };

const DIRS = [
  { key: 'a', name: 'الف · لاجوردی شب', note: 'تکامل نمونهٔ اول: تیره، طلایی و فیروزه‌ای، طاق و گره' },
  { key: 'b', name: 'ب · نهادی و روشن', note: 'ساختار سبک Amii: بدنهٔ روشن، قهرمان تیره، شبکهٔ ستونی' },
  { key: 'c', name: 'ج · ترکیبی', note: 'بدنهٔ روشن، قهرمان و پانویس لاجوردی با نقش‌مایهٔ گره' },
  { key: 'd', name: 'د · بنتو', note: 'دور ۲: لاجوردی عمیق، کاشی‌های شیشه‌ای، درخشش نرم، شبکهٔ ماژولار' },
  { key: 'e', name: 'ه · سرمقاله‌ای', note: 'دور ۲: کاغذ عاجی، تایپوگرافی بسیار درشت، خط‌های ضخیم، بی کارت' },
  { key: 'f', name: 'و · شفق', note: 'دور ۲: روشن، نور رنگی شفق در قهرمان، منوی شناور، کارت‌های نرم' },
];

export default function LabIndex() {
  return (
    <main className="lab-index" id="main">
      <h1>کاوش طراحی · دور ۱ و ۲</h1>
      <p>سه جهت برای صفحهٔ خانه، با محتوای واقعی. همه noindex هستند و در تولید بسته‌اند.</p>
      <ul>
        {DIRS.map((d) => (
          <li key={d.key}>
            <Link href={`/lab/${d.key}`}>
              <strong>{d.name}</strong>
              <span>{d.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
