import Link from 'next/link';

export const metadata = { title: 'Lab' };

const DIRS = [
  { key: 'a', name: 'الف · لاجوردی شب', note: 'تکامل نمونهٔ اول: تیره، طلایی و فیروزه‌ای، طاق و گره' },
  { key: 'b', name: 'ب · نهادی و روشن', note: 'ساختار سبک Amii: بدنهٔ روشن، قهرمان تیره، شبکهٔ ستونی' },
  { key: 'c', name: 'ج · ترکیبی', note: 'بدنهٔ روشن، قهرمان و پانویس لاجوردی با نقش‌مایهٔ گره' },
];

export default function LabIndex() {
  return (
    <main className="lab-index" id="main">
      <h1>کاوش طراحی · دور ۱</h1>
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
