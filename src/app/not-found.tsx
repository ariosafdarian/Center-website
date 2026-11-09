import Link from 'next/link';

// Fallback for requests outside the locale routes (e.g. /foo.php). Persian, as the default locale.
export default function GlobalNotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <main>
          <h1>این صفحه پیدا نشد</h1>
          <p>
            <Link href="/">صفحهٔ خانه</Link> · <Link href="/contact">ثبت درخواست</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
