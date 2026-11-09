import { z } from 'zod';

/**
 * Content provenance:
 *  - 'rfp'     text taken verbatim from docs/RFP.md
 *  - 'v1'      text imported verbatim from reference/v1/content.py
 *  - 'draft'   drafted by Claude Code; must be shown at a review gate
 *  - 'pending' placeholder until reference/v1 is imported (npm run import:v1)
 */
export const Source = z.enum(['rfp', 'v1', 'draft', 'pending']);
export type Source = z.infer<typeof Source>;

const text = z.string().trim().min(1);

/** A bilingual string. Both languages are mandatory: the build fails otherwise. */
export const L = z.object({ fa: text, en: text }).strict();
export type L = z.infer<typeof L>;

export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const PathKey = z.enum(['org', 'talent', 'partner', 'sponsor', 'other']);
export type PathKey = z.infer<typeof PathKey>;
export const AUDIENCE_KEYS = ['org', 'talent', 'partner', 'sponsor'] as const;
export const Audience = z.enum(AUDIENCE_KEYS);
export type Audience = z.infer<typeof Audience>;

/** Every content module exports `{ sample, data }`. */
export const contentFile = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ sample: z.boolean(), data }).strict();

// ---------- site.ts ----------
export const SiteSchema = contentFile(
  z.object({
    name: z.object({ full: L, line1: L, line2: L, short: L }),
    slogan: z.object({ parts: z.array(L).length(3) }),
    address: L,
    phone: z.object({ e164: z.string().regex(/^\+\d{8,15}$/), display: L }),
    email: z.email(),
    hours: L,
    socials: z.array(
      z.object({ key: z.enum(['bale', 'eitaa', 'rubika', 'aparat', 'instagram', 'linkedin']), label: L, url: z.url() }),
    ),
    domain: z.string(),
  }),
);

// ---------- paths.ts ----------
export const PathSchema = z.object({
  key: PathKey,
  label: L,
  audience: L,
  cta: L.nullable(),
  source: Source,
});
export const PathsSchema = contentFile(z.array(PathSchema).length(5));
export type PathItem = z.infer<typeof PathSchema>;

// ---------- activities.ts ----------
export const DomainSchema = z.object({ key: slug, title: L, source: Source });
export const ActivitySchema = z.object({
  id: slug,
  domain: slug,
  audiences: z.array(Audience).min(1),
  title: L,
  summary: L,
  source: Source,
});
export const ActivitiesSchema = contentFile(
  z.object({
    domains: z.array(DomainSchema).length(7),
    /** 42 items once imported from v1; empty until then. */
    activities: z.array(ActivitySchema),
  }),
);
export type Domain = z.infer<typeof DomainSchema>;
export type Activity = z.infer<typeof ActivitySchema>;

// ---------- spaces.ts ----------
export const SpaceSchema = z.object({
  key: slug,
  layer: z.number().int().min(1).max(3),
  title: L,
  access: L,
  components: z.array(L),
  source: Source,
});
export const SpacesSchema = contentFile(z.array(SpaceSchema).length(3));
export type Space = z.infer<typeof SpaceSchema>;

// ---------- network.ts ----------
export const RingSchema = z.object({ key: slug, title: L, summary: L.nullable(), source: Source });
export const NetworkSchema = contentFile(z.array(RingSchema).length(7));
export type Ring = z.infer<typeof RingSchema>;

// ---------- events.ts ----------
export const EventSchema = z.object({
  slug,
  title: L,
  summary: L.nullable(),
  /** ISO 8601 (Gregorian), Tehran local time with offset. */
  start: z.iso.datetime({ offset: true }),
  audiences: z.array(Audience).min(1),
  /** Only real events get Event JSON-LD. */
  real: z.boolean(),
  source: Source,
});
export const EventsSchema = contentFile(z.array(EventSchema));
export type EventItem = z.infer<typeof EventSchema>;

// ---------- faq.ts ----------
export const FaqSchema = z.object({ id: slug, q: L, a: L, source: Source });
export const FaqsSchema = contentFile(z.array(FaqSchema));
export type FaqItem = z.infer<typeof FaqSchema>;

// ---------- model.ts (work model, gap) ----------
export const ModelSchema = contentFile(
  z.object({
    message: L,
    steps: z.array(z.object({ key: slug, title: L, body: L, source: Source })).length(3),
    contract: L,
    gap: z.object({
      groups: z.array(z.object({ key: slug, title: L, source: Source })).length(3),
      core: L,
    }),
    domainsCount: z.literal(7),
    activitiesCount: z.literal(42),
  }),
);

// ---------- form-options.ts ----------
const Option = z.object({ value: slug, label: L });
export const FormOptionsSchema = contentFile(
  z.object({
    area: z.array(Option).min(1),
    size: z.array(Option).min(1),
    support: z.array(Option).min(1),
    topic: z.array(z.object({ value: z.enum(['event', 'visit', 'venue', 'press', 'other']), label: L })).length(5),
    source: Source,
  }),
);
