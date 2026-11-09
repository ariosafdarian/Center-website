import { EventsSchema } from './schema';

// Six sample events (Azar–Dey 1405) named in RFP § "داده‌های نمونه".
// Dates are placeholders inside that range; none is real, so no Event JSON-LD.
export const events = EventsSchema.parse({
  sample: true,
  data: [
    {
      slug: 'scifi-cinema-night',
      title: { fa: 'شب سینمای علمی‌تخیلی', en: 'Science fiction cinema night' },
      summary: null,
      start: '2026-11-26T18:00:00+03:30',
      audiences: ['talent', 'sponsor'],
      real: false,
      source: 'rfp',
    },
    {
      slug: 'banking-reverse-pitch',
      title: { fa: 'ارائهٔ معکوس مسئله‌های بانکی', en: 'Reverse pitch: banking problems' },
      summary: null,
      start: '2026-12-03T10:00:00+03:30',
      audiences: ['org', 'partner'],
      real: false,
      source: 'rfp',
    },
    {
      slug: 'robot-battle-league',
      title: { fa: 'لیگ نبرد ربات‌ها', en: 'Robot Battle League' },
      summary: null,
      start: '2026-12-10T16:00:00+03:30',
      audiences: ['talent', 'partner', 'sponsor'],
      real: false,
      source: 'rfp',
    },
    {
      slug: 'executive-bootcamp',
      title: { fa: 'بوت‌کمپ مدیران', en: 'Executive bootcamp' },
      summary: null,
      start: '2026-12-17T09:00:00+03:30',
      audiences: ['org'],
      real: false,
      source: 'rfp',
    },
    {
      slug: 'elite-club-tech-night',
      title: { fa: 'شب فنی باشگاه نخبگان', en: 'Elite club tech night' },
      summary: null,
      start: '2026-12-31T18:00:00+03:30',
      audiences: ['talent'],
      real: false,
      source: 'rfp',
    },
    {
      slug: 'urban-problems-hackathon',
      title: { fa: 'هکاتون مسئله‌های شهری', en: 'Urban problems hackathon' },
      summary: null,
      start: '2027-01-14T09:00:00+03:30',
      audiences: ['talent', 'partner', 'org'],
      real: false,
      source: 'rfp',
    },
  ],
});

export const getEvent = (slug: string) => events.data.find((e) => e.slug === slug);

/** Upcoming events, soonest first. `now` is injectable for tests and builds. */
export const upcomingEvents = (now = new Date(), limit?: number) => {
  const list = [...events.data]
    .filter((e) => new Date(e.start) >= now)
    .sort((a, b) => a.start.localeCompare(b.start));
  return limit ? list.slice(0, limit) : list;
};
