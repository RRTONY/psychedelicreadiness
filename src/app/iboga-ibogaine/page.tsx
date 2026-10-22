import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, TreeDeciduous, Pill, Star } from "lucide-react";
import {
  IBOGA_IMAGES,
  IBOGAINE_PHARMACOLOGY,
  ALKALOID_COMPARISON,
  HEAD_TO_HEAD,
  IBOGAINE_OUTCOMES,
  IBOGA_SUPPLEMENT_STACKS,
  IBOGA_DIM_SCORES,
  IBOGA_MEDICINE_SELECTOR,
  IBOGA_SOURCES,
  IBOGA_DISCLAIMER,
  IBOGA_PHARMA_ALTERNATIVES,
} from "@/lib/content/pri-iboga-module";
import { PriSection, PriEyebrow } from "@/components/pri/pri-section";
import { IbogaPharmaTable } from "@/components/pri/iboga-pharma-table";
import { IbogaCompassSection } from "@/components/pri/iboga-compass-section";

// Ported from legacy client/src/pages/pri/IbogaDeepDive.tsx — "The Plant vs
// The Isolate": real alkaloid-profile comparison, real receptor
// pharmacology, real head-to-head iboga-vs-ibogaine table, real clinical
// outcomes (Mash/Noller/Schenberg/Brown & Alper/Cherian/Williams,
// including the 2024 Stanford Nature Medicine SOF-veteran data and the
// 2026 19,071-patient safety analysis), real pharma-to-plant alternatives,
// real supplement protocol, real dimension thresholds, real medicine
// selector, Tony's real first-hand account of sitting ibogaine at The
// Mission Within, real hard-stop contraindications, a real 9-facility
// directory (with the 2 facilities legacy explicitly removed and why),
// real Nagoya Protocol / extractive-capitalism argument, real 2026 US
// legal-status rundown, the embedded Iboga Compass v2 documentation
// section, and real sources — all ported unchanged and verbatim. Fully
// static except the pharma-table expand toggle and the compass section's
// question-group toggles (both extracted into client islands), so this
// stays a plain Server Component. Legacy's purely decorative CSS
// glow/shimmer `<style>` block is dropped, same call made throughout this
// migration.
export const metadata: Metadata = {
  title: "Iboga vs Ibogaine — Deep Dive | Psychedelic Readiness Index",
  description:
    "The Plant vs The Isolate. Full alkaloid profiles, receptor pharmacology, Bwiti tradition vs clinical protocol, outcomes data, and supplement stacks.",
  alternates: { canonical: "/iboga-ibogaine" },
};

const thClass = "border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase";
const tdClass = "border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.95rem] leading-[1.55] text-pri-brown";
const thDarkClass = "border-b-2 border-[#3A3530] bg-[#2A2420] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-purple-light uppercase";
const tdDarkClass = "border-b border-[#3A3530] px-3 py-2.5 align-top text-[.95rem] leading-[1.55] text-pri-cream";

/** Medicine-selector cell: a "✓" in the data renders as a check icon with screen-reader text. */
function SelectorMark({ value }: { value: string }) {
  if (value !== "✓") return value;
  return (
    <>
      <Check aria-hidden="true" className="mx-auto size-4" />
      <span className="sr-only">Yes</span>
    </>
  );
}

const UPDATED_RESEARCH = [
  { condition: "Opioid withdrawal elimination", result: "80–90%", source: "Mash et al., Ann NY Acad Sci 2000" },
  { condition: "Opioid abstinence at 6 months (n=88)", result: "54%", source: "Davis et al., J Psychedelic Studies 2017" },
  { condition: "Opioid craving reduction at 12 months", result: "50–60%", source: "Noller et al., Am J Drug Alcohol Abuse 2018" },
  { condition: "Cocaine dependence", result: "60–70%", source: "Schenberg et al., J Psychopharmacol 2014" },
  { condition: "Alcohol use disorder", result: "50–65%", source: "Brown & Alper 2018" },
  { condition: "SOF veterans — PTSD reduction at 1 month", result: "88%", source: "Cherian et al., Nature Medicine, Jan 2024" },
  { condition: "SOF veterans — depression reduction at 1 month", result: "87%", source: "Cherian et al., Nature Medicine 2024" },
  { condition: "SOF veterans — anxiety reduction at 1 month", result: "81%", source: "Cherian et al., Nature Medicine 2024" },
  { condition: "SOF veterans no longer meeting PTSD criteria at 1 year", result: "71%", source: "Williams et al., Nature Mental Health, July 2025" },
  { condition: "Mission Within veterans — no longer meet PTSD criteria", result: "80%", source: "missionwithin.org, verified June 2026" },
  { condition: "Safety across 19,071 patients at 11 clinics", result: "6 deaths — all opioid-use-disorder; zero in non-SUD", source: "Research Square multisite analysis, June 2026" },
];

const FEATURED_FACILITIES = [
  {
    star: true,
    name: "The Mission Within",
    location: "Baja California, Mexico",
    focus: "Veterans only",
    url: "https://missionwithin.org",
    pricing: "Contact directly",
    body: "This is where I sat. This is what I witnessed. This is the one I can speak to from personal experience rather than research. Founded and led by Dr. Martín Polanco — a Mexican-licensed physician with over 26 years of clinical experience in ibogaine medicine, the most experienced ibogaine physician in North America, who has treated more than 5,000 patients. He set up the first medically supervised ibogaine clinic in North America near Tijuana in 2001. 6-week clinical program built for special operations veterans and their families. Virtual preparation. Five-day in-person medicine retreat: ibogaine ceremony overnight, individual 5-MeO-DMT sessions, therapist-led integration. Ongoing peer support community of veterans healing together. Their numbers: 1,200+ veterans and family members treated since 2017. 80% no longer meeting PTSD diagnostic criteria.",
    who: "Military veterans, active duty, first responders, and their families. Peer-to-peer healing in a community that understands military trauma from the inside. Not a general population program.",
    partners: "SEAL Future Foundation · SOC-F · Heroic Hearts Project · The Hope Project",
  },
  {
    star: false,
    name: "Ambio Life Sciences",
    location: "Tijuana / Playas de Tijuana, Baja California, Mexico",
    focus: null,
    url: "https://ambio.life",
    pricing: "From $7,350 USD (published)",
    body: "The Stanford MISTIC study site — those 30 Navy SEALs, that Nature Medicine paper, those numbers. The world's first and only Nagoya-compliant ibogaine clinic. Six private residential clinics across Baja California. Netflix's In Waves and War (November 2025) was filmed here. GITA-aligned. Co-founder Jonathan Dickinson received Missoko Bwiti initiation in Gabon before building a clinic. They treat addiction, TBI, PTSD, Parkinson's, MS, and performance optimization.",
    who: "Anyone who wants the most rigorously evidenced ibogaine protocol available and for whom Nagoya compliance and indigenous reciprocity is non-negotiable.",
    partners: null,
  },
  {
    star: false,
    name: "Beōnd Ibogaine",
    location: "Cancún, Quintana Roo, Mexico (Level 2 travel advisory)",
    focus: null,
    url: "https://beondibogaine.com",
    pricing: "Contact directly",
    body: "9 MDs and 23 RNs on-site. Stanford-aligned cardiac protocols. 5-phase model starting weeks before arrival, continuing months after departure. Veteran program (Beond Service) launched January 2025. Plants 3 iboga trees in Gabon per treatment through Blessings of the Forest. Nagoya-compliant.",
    who: "Serious cases wanting maximum medical infrastructure with genuine commitment to indigenous reciprocity.",
    partners: null,
  },
  {
    star: false,
    name: "MindScape Retreat",
    location: "Cozumel, Quintana Roo, Mexico (Level 2)",
    focus: null,
    url: "https://www.mindscaperetreat.com",
    pricing: "Contact directly — includes 90-day aftercare",
    body: "900+ patients, zero cardiac events (facility-reported). What sets them apart: they publish their full contraindications list, cardiac screening protocol, and QTc thresholds publicly. Most clinics bury this. MindScape puts it on the homepage. 90-day structured aftercare included. Treatment does not affect VA eligibility or benefit status.",
    who: "Veterans and civilians who want maximum medical transparency and structured long-term aftercare.",
    partners: null,
  },
  {
    star: false,
    name: "Clear Sky Recovery",
    location: "Cancún, Mexico (Level 2)",
    focus: null,
    url: "https://clearskyrecovery.com",
    pricing: "~$5,500–$8,000 (third-party estimate)",
    body: "Beachfront Cancún. 7–10 day programs. Strong track record in opioid and alcohol addiction.",
    who: "Addiction focus, mid-range budget, Cancún location.",
    partners: null,
  },
  {
    star: false,
    name: "Experience Ibogaine",
    location: "Rosarito Beach, Baja California, Mexico (Level 3 region)",
    focus: null,
    url: "https://www.experienceibogaine.com",
    pricing: "Contact directly",
    body: "10+ years operating. Active research partnerships with Ohio State University. Veteran discounts. The detail that matters most: they properly decline cardiac cases, referring patients to Tijuana cardiologists when an EKG fails. That is the green flag that should matter more to you than the amenities photography.",
    who: "Addiction, PTSD, budget-conscious, Baja proximity.",
    partners: null,
  },
  {
    star: false,
    name: "IbogaQuest",
    location: "Tepoztlán, Morelos, Mexico",
    focus: null,
    url: "https://ibogaquest.com",
    pricing: "USA: +1 (802) 748-4600",
    body: "Founded 2009 — one of the longest continuously operating centers in North America. Small groups in the spiritual mountain town of Tepoztlán. Verified reviews include repeat clients who booked a second visit three months after the first. That data point matters more than any marketing copy.",
    who: "Spiritual seekers and trauma cases who want psychospiritual depth alongside clinical safety.",
    partners: null,
  },
  {
    star: false,
    name: "Tabula Rasa Retreat",
    location: "Portugal",
    focus: null,
    url: "https://tabularasaretreat.com",
    pricing: "Contact directly",
    body: "Europe's leading ibogaine facility. ACLS-trained staff. Lifetime online aftercare. Legal under Portugal's harm-reduction framework — no Mexico logistics, no border concerns, no Level 3 advisories.",
    who: "European patients or anyone who wants a legal European setting.",
    partners: null,
  },
  {
    star: false,
    name: "Bwiti House — Moughenda Mikala",
    location: "Gabon, West Africa",
    focus: null,
    url: "https://bwitihouse.com",
    pricing: "Contact directly",
    body: "This is the source. Moughenda Mikala is one of the most respected nganga globally. Full Tabernanthe iboga root bark, not HCl. Authentic Missoko Bwiti initiation lasting up to three days. This is the medicine in its most potent, most unpredictable, most transformative form. Only appropriate for thoroughly cardiac-screened, physically healthy individuals with genuine respect for the tradition they are entering. No continuous Western cardiac monitoring.",
    who: "Spiritual seekers with clean cardiac screening, robust health, and genuine reverence for the tradition.",
    partners: null,
  },
];

const ADDITIONAL_FACILITIES = [
  { name: "Iboga Wellness Institute", location: "International", focus: "Navigation · complex case coordination", url: "https://theibogainstitute.org" },
  { name: "New Roots Ibogaine", location: "Mexico", focus: "Opioid replacement specialists", url: "https://newrootsibogaine.com" },
  { name: "Transcend Ibogaine", location: "Cancún, MX (Level 2)", focus: "Bilingual · cardiology-trained", url: "https://transcendibogaine.com" },
  { name: "Root Healing", location: "Portugal", focus: "Bwiti lineage · depression", url: "https://roothealing.com" },
  { name: "Iboga Wellness Center", location: "Costa Rica", focus: "Bwiti-informed · spiritual", url: "https://ibogawellness.com" },
  { name: "Awakening Soul", location: "Costa Rica", focus: "Life reset · small groups", url: "https://awakeningsoul.com" },
];

const QUICK_REFERENCE = [
  { name: "The Mission Within", loc: "Baja California, MX", travel: "Level 3 (regional)", vet: "Primary", primary: true, nagoya: "No", price: "Contact" },
  { name: "Ambio Life Sciences", loc: "Tijuana, MX", travel: "Level 3 (regional)", vet: "Yes", nagoya: "Only globally", price: "From $7,350" },
  { name: "Beōnd Ibogaine", loc: "Cancún, MX", travel: "Level 2", vet: "Yes", nagoya: "Yes", price: "Contact" },
  { name: "MindScape Retreat", loc: "Cozumel, MX", travel: "Level 2", vet: "Yes", nagoya: "No", price: "Contact" },
  { name: "Clear Sky Recovery", loc: "Cancún, MX", travel: "Level 2", vet: "No", nagoya: "No", price: "~$5,500–$8,000" },
  { name: "Experience Ibogaine", loc: "Rosarito, MX", travel: "Level 3 (regional)", vet: "Discounts", nagoya: "No", price: "Contact" },
  { name: "IbogaQuest", loc: "Tepoztlán, MX", travel: "Low", vet: "No", nagoya: "No", price: "Contact" },
  { name: "Tabula Rasa Retreat", loc: "Portugal", travel: "N/A", vet: "No", nagoya: "No", price: "Contact" },
  { name: "Bwiti House", loc: "Gabon", travel: "N/A", vet: "No", nagoya: "Yes", price: "Contact" },
];

const LEGAL_STATUS_ITEMS = [
  { label: "Baja California", detail: "US State Dept Level 3: Reconsider Travel. Regional organized crime advisory — not facility-specific." },
  { label: "Quintana Roo (Cancún, Cozumel)", detail: "US State Dept Level 2: Exercise Increased Caution." },
  { label: "April 2026: White House Executive Order", detail: "Directed FDA and DEA to facilitate a Right to Try pathway for ibogaine. Ibogaine remains Schedule I — this initiates a regulatory process only." },
  { label: "Texas SB 2308 (2025)", detail: "$50 million for ibogaine clinical trials through UTHealth Houston and UTMB Galveston. Largest single public investment in psychedelic medicine research in US history." },
  { label: "VA and Military", detail: "Treatment in Mexico does not affect VA eligibility, disability rating, or benefit status. No reporting mechanism exists." },
];

export default function IbogaIbogainePage() {
  return (
    <div className="min-h-screen bg-pri-cream font-body">
      {/* ── HERO ── */}
      <section className="relative flex min-h-[85vh] flex-col justify-end overflow-hidden">
        <Image src={IBOGA_IMAGES.hero} alt="Bwiti ceremony with Tabernanthe iboga root bark" fill sizes="100vw" fetchPriority="high" loading="eager" className="object-cover brightness-50 contrast-110 saturate-110" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0A0806]/97 via-[#0A0806]/70 to-[#0A0806]/15" />
        <div className="relative z-10 mx-auto w-full max-w-225 px-6 pb-16">
          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold tracking-[0.08em] text-[#D4B96A] uppercase">
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to PRI
          </Link>
          <div className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-[#D4B96A] uppercase">
            <span className="block h-0.5 w-6 bg-[#D4B96A]" />
            The Plant vs The Isolate
          </div>
          <h1 className="mb-4 font-heading font-extrabold text-[clamp(2.2rem,6vw,4rem)] text-[#FAFAF7]">Iboga vs Ibogaine</h1>
          <p className="max-w-175 text-[clamp(1.1rem,2.5vw,1.35rem)] leading-[1.6] text-[#E8E2D8]">
            Twelve companion alkaloids in sacred synergy — or one purified molecule under cardiac monitoring. The Bwiti have known for centuries what
            Western medicine is only now beginning to measure.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <span className="rounded border border-[#D4B96A]/40 bg-[#D4B96A]/15 px-4 py-1.5 text-sm font-semibold text-[#D4B96A]">Iboga: 24–72 hrs</span>
            <span className="rounded border border-[#D4B96A]/40 bg-[#D4B96A]/15 px-4 py-1.5 text-sm font-semibold text-[#D4B96A]">Ibogaine: 18–36 hrs</span>
            <span className="flex items-center gap-1.5 rounded border border-pri-purple/40 bg-pri-purple/15 px-4 py-1.5 text-sm font-semibold text-[#E8A09A]">
              <AlertTriangle className="size-4" />
              Cardiac screening mandatory
            </span>
          </div>
        </div>
      </section>

      {/* ── ALKALOID COMPARISON ── */}
      <PriSection id="alkaloids">
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] max-h-85 w-full overflow-hidden rounded-xl">
          <Image src={IBOGA_IMAGES.alkaloidComparison} alt="Alkaloid comparison visualization" fill sizes="100vw" className="object-cover brightness-90 contrast-110" />
        </div>
        <PriEyebrow>Alkaloid Profiles</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">The Entourage Effect</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          Tabernanthe iboga root bark contains at least twelve identified indole alkaloids — approximately 6% of the dried bark by weight. Ibogaine is the
          most abundant (50–80% of total alkaloid content), but the companion alkaloids — ibogamine, tabernanthine, voacangine, coronaridine, ibogaline,
          and noribogaine — each contribute distinct pharmacological actions. Traditional Bwiti practitioners have always insisted the whole root bark is
          greater than any single compound. Western pharmacology is beginning to agree.
        </p>
        <div className="mb-6 rounded-md border-l-4 border-[#E65100] bg-[#FFF3E0] p-5">
          <p className="m-0 mb-1 font-bold text-[#C24400]">Entourage Hypothesis</p>
          <p className="m-0 text-[1.05rem] leading-[1.75] text-pri-brown">
            Like cannabis (THC + CBD + terpenes) and ayahuasca (DMT + harmalines), iboga&apos;s full alkaloid profile may produce synergistic effects that
            isolated ibogaine cannot replicate. Coronaridine alone shows independent anti-addictive properties at NIDA. Tabernanthine provides the stimulant
            phase. Voacangine contributes anti-inflammatory action.
          </p>
        </div>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-187.5 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Alkaloid</th>
                <th className={thClass}>Abundance</th>
                <th className={thClass}>Primary Action</th>
                <th className={thClass}>Unique Property</th>
                <th className={thClass}>Present In</th>
              </tr>
            </thead>
            <tbody>
              {ALKALOID_COMPARISON.map((r, i) => (
                <tr key={r.alkaloid} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} font-bold whitespace-nowrap`}>{r.alkaloid}</td>
                  <td className={tdClass}>{r.abundance}</td>
                  <td className={tdClass}>{r.primaryAction}</td>
                  <td className={tdClass}>{r.uniqueProperty}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{r.presentIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PriSection>

      {/* ── RECEPTOR PHARMACOLOGY ── */}
      <PriSection id="pharmacology" dark>
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] max-h-85 w-full overflow-hidden rounded-xl">
          <Image src={IBOGA_IMAGES.pharmacology} alt="Receptor pharmacology" fill sizes="100vw" className="object-cover brightness-85 contrast-115" />
        </div>
        <PriEyebrow>Receptor Pharmacology</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">Multi-Target Mechanism</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          Ibogaine is pharmacologically unique among psychedelics — it simultaneously engages opioid, glutamate, serotonin, dopamine, and nicotinic systems.
          No other known compound hits this many addiction-relevant targets in a single dose. Its primary metabolite, noribogaine, extends the therapeutic
          window to 24–48 hours with stronger mu-opioid and serotonin transporter affinity than the parent compound.
        </p>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-162.5 border-collapse">
            <thead>
              <tr>
                <th className={thDarkClass}>Receptor</th>
                <th className={thDarkClass}>Action</th>
                <th className={thDarkClass}>Clinical Relevance</th>
                <th className={thDarkClass}>Ki (Ibogaine)</th>
              </tr>
            </thead>
            <tbody>
              {IBOGAINE_PHARMACOLOGY.map((r, i) => (
                <tr key={r.receptor} className={i % 2 ? "bg-white/3" : ""}>
                  <td className={`${tdDarkClass} font-bold whitespace-nowrap`}>{r.receptor}</td>
                  <td className={tdDarkClass}>{r.action}</td>
                  <td className={tdDarkClass}>{r.clinicalUse}</td>
                  <td className={`${tdDarkClass} font-mono whitespace-nowrap`}>{r.ibogaineKi || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded-md border-l-4 border-[#E57373] bg-[#C62828]/12 p-5">
          <p className="m-0 mb-1 flex items-center gap-1.5 text-base font-bold text-[#E57373]">
            <AlertTriangle className="size-4" />
            Noribogaine: The Hidden Duration
          </p>
          <p className="m-0 text-[1.05rem] leading-[1.75] text-pri-cream/80">
            Ibogaine&apos;s half-life is 4–7 hours. But its metabolite noribogaine persists for 24–48 hours with stronger mu-opioid and SERT binding. This
            is why opioid withdrawal relief extends far beyond ibogaine&apos;s direct action — and why cardiac monitoring must continue for at least 72
            hours post-treatment.
          </p>
        </div>
      </PriSection>

      {/* ── HEAD-TO-HEAD ── */}
      <PriSection id="comparison">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative h-65 max-h-65 overflow-hidden rounded-xl">
            <Image src={IBOGA_IMAGES.bwitiTradition} alt="Bwiti tradition" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="relative h-65 max-h-65 overflow-hidden rounded-xl">
            <Image src={IBOGA_IMAGES.clinicalSetting} alt="Clinical ibogaine treatment" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
        <PriEyebrow>Head-to-Head</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">Sacred Bark vs Clinical Isolate</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          The Bwiti tradition and Western ibogaine clinics approach the same plant from opposite ends of the epistemological spectrum. One treats the root
          bark as a living intelligence — a teacher plant that communicates through visions, purging, and ancestor contact. The other isolates the most
          pharmacologically active molecule and administers it under EKG monitoring. Both save lives. Neither is wrong.
        </p>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-150 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Dimension</th>
                <th className="border-b-2 border-[#D4CFC5] bg-[#2A5A2A] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-white uppercase">
                  <span className="flex items-center gap-1.5">
                    <TreeDeciduous className="size-3.5" />
                    Iboga (Whole Plant)
                  </span>
                </th>
                <th className="border-b-2 border-[#D4CFC5] bg-[#4A2A5A] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-white uppercase">
                  <span className="flex items-center gap-1.5">
                    <Pill className="size-3.5" />
                    Ibogaine (HCl Isolate)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {HEAD_TO_HEAD.map((r, i) => (
                <tr key={r.dimension} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} font-bold whitespace-nowrap`}>{r.dimension}</td>
                  <td className={tdClass}>{r.iboga}</td>
                  <td className={tdClass}>{r.ibogaine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PriSection>

      {/* ── OUTCOMES ── */}
      <PriSection id="outcomes" dark>
        <PriEyebrow>Clinical Outcomes</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">What the Data Shows</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          Most clinical data is on ibogaine HCl, not whole iboga — because clinical trials require standardized dosing. The Bwiti tradition has thousands of
          years of observational evidence but limited Western-style controlled studies. What exists is compelling: single-dose ibogaine eliminates opioid
          withdrawal in 80–90% of cases and sustains craving reduction at 12 months in over half of participants.
        </p>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-137.5 border-collapse">
            <thead>
              <tr>
                <th className={thDarkClass}>Condition</th>
                <th className={thDarkClass}>Improvement</th>
                <th className={thDarkClass}>Source</th>
              </tr>
            </thead>
            <tbody>
              {IBOGAINE_OUTCOMES.map((r, i) => (
                <tr key={r.condition} className={i % 2 ? "bg-white/3" : ""}>
                  <td className={`${tdDarkClass} font-bold`}>{r.condition}</td>
                  <td className={`${tdDarkClass} font-mono font-bold text-[#D4B96A]`}>{r.improved}</td>
                  <td className={`${tdDarkClass} text-[.85rem] opacity-80`}>{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded-md border-l-4 border-[#FFB74D] bg-[#E65100]/12 p-5">
          <p className="m-0 mb-1 text-base font-bold text-[#FFB74D]">Limitations</p>
          <p className="m-0 text-[1.05rem] leading-[1.75] text-pri-cream/80">
            Most studies are observational, not randomized controlled trials. Sample sizes are small (n=12–88). Publication bias likely inflates success
            rates. Ibogaine is not FDA-approved. The Stanford TBI trial (2024) is the most rigorous to date. Whole-iboga outcomes data is almost entirely
            anecdotal from Bwiti practitioners.
          </p>
        </div>
      </PriSection>

      {/* ── PHARMA ALTERNATIVES ── */}
      <PriSection id="pharma-alternatives">
        <PriEyebrow>Pharma → Plant Alternatives</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">What Iboga Replaces</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          Ibogaine&apos;s multi-receptor profile means it mechanistically overlaps with several pharmaceutical categories — opioid agonists, antagonists,
          NMDA modulators, SSRIs, and smoking cessation agents. A single ibogaine session can address what would otherwise require 3–5 separate
          prescriptions with their respective side-effect profiles.
        </p>
        <IbogaPharmaTable rows={IBOGA_PHARMA_ALTERNATIVES} />
      </PriSection>

      {/* ── SUPPLEMENT STACKS ── */}
      <PriSection id="supplements" dark>
        <PriEyebrow>Supplement Protocol</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">Preparation &amp; Integration Stacks</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          Ibogaine preparation is more medically intensive than any other psychedelic. Cardiac support (CoQ10, magnesium, potassium) is non-negotiable. The
          4–8 week pre-treatment window is critical for building physiological resilience. Post-integration extends longer than most medicines due to
          noribogaine&apos;s sustained 24–48 hour half-life.
        </p>
        {IBOGA_SUPPLEMENT_STACKS.map((phase) => (
          <div key={phase.phase} className="mb-8">
            <h3 className="mb-0.5 font-heading font-extrabold text-xl text-[#D4B96A]">{phase.phase}</h3>
            <p className="mb-3 text-[.9rem] text-pri-cream/70">{phase.timing}</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
              {phase.items.map((item) => (
                <div key={item.name} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-base font-bold text-pri-cream">{item.name}</div>
                  <div className="mt-1 font-mono text-[.85rem] text-[#D4B96A]">{item.dosage}</div>
                  {item.searchUrl && (
                    <a href={item.searchUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-[.8rem] text-pri-cream/50 underline md:min-h-6">
                      Find on Amazon
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </PriSection>

      {/* ── DIMENSION SCORES ── */}
      <PriSection id="dimensions">
        <PriEyebrow>PRI Dimension Thresholds</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">Readiness Requirements</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          Iboga and ibogaine demand the highest readiness thresholds of any medicine in the PRI. The 24–72 hour duration, cardiac risk profile, and
          intensity of the visionary experience mean that every dimension must be at or near maximum before proceeding.
        </p>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-162.5 border-collapse">
            <thead>
              <tr>
                <th className={thClass}><span className="sr-only">Icon</span></th>
                <th className={thClass}>Dimension</th>
                <th className={thClass}>Iboga Threshold</th>
                <th className={thClass}>Ibogaine Threshold</th>
                <th className={thClass}>Key Consideration</th>
              </tr>
            </thead>
            <tbody>
              {IBOGA_DIM_SCORES.map((r, i) => (
                <tr key={r.dimension} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} w-10 text-center`}>
                    <r.icon aria-hidden="true" className="mx-auto size-6 text-[#836311]" />
                  </td>
                  <td className={`${tdClass} font-bold whitespace-nowrap`}>{r.dimension}</td>
                  <td className={`${tdClass} font-bold ${r.ibogaThreshold.includes("Critical") ? "text-[#581C87]" : "text-[#836311]"}`}>{r.ibogaThreshold}</td>
                  <td className={`${tdClass} font-bold ${r.ibogaineThreshold.includes("Critical") ? "text-[#581C87]" : "text-[#836311]"}`}>{r.ibogaineThreshold}</td>
                  <td className={tdClass}>{r.keyNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PriSection>

      {/* ── MEDICINE SELECTOR ── */}
      <PriSection id="selector" dark>
        <PriEyebrow>Medicine Comparison</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">Where Iboga Fits</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          Ibogaine is the strongest evidence-based medicine for opioid addiction interruption. For depression, ketamine acts faster. For PTSD, MDMA has the
          strongest trial data. For spiritual development, iboga (whole plant) in Bwiti context is unmatched in depth and duration. Know what you need
          before choosing.
        </p>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-187.5 border-collapse">
            <thead>
              <tr>
                <th className={thDarkClass}><span className="sr-only">Icon</span></th>
                <th className={thDarkClass}>Medicine</th>
                <th className={thDarkClass}>Addiction</th>
                <th className={thDarkClass}>Depression</th>
                <th className={thDarkClass}>PTSD</th>
                <th className={thDarkClass}>TBI</th>
                <th className={thDarkClass}>Duration</th>
                <th className={thDarkClass}>Beginner</th>
                <th className={thDarkClass}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {IBOGA_MEDICINE_SELECTOR.map((r, i) => {
                const isIboga = r.medicine.includes("Iboga");
                return (
                  <tr key={r.medicine} className={isIboga ? "bg-[#D4B96A]/8" : i % 2 ? "bg-white/3" : ""}>
                    <td className={`${tdDarkClass} w-9 text-center`}>
                      <r.icon aria-hidden="true" className="mx-auto size-5 text-[#D4B96A]" />
                    </td>
                    <td className={`${tdDarkClass} whitespace-nowrap ${isIboga ? "font-extrabold" : "font-semibold"}`}>{r.medicine}</td>
                    <td className={`${tdDarkClass} text-center`}>
                      <SelectorMark value={r.addiction} />
                    </td>
                    <td className={`${tdDarkClass} text-center`}>
                      <SelectorMark value={r.depression} />
                    </td>
                    <td className={`${tdDarkClass} text-center`}>
                      <SelectorMark value={r.ptsd} />
                    </td>
                    <td className={`${tdDarkClass} text-center`}>
                      <SelectorMark value={r.tbi} />
                    </td>
                    <td className={`${tdDarkClass} font-mono whitespace-nowrap`}>{r.duration}</td>
                    <td className={`${tdDarkClass} text-center`}>{r.beginner}</td>
                    <td className={tdDarkClass}>{r.evidence}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PriSection>

      {/* ── FIRST-HAND ACCOUNT & RESEARCH ── */}
      <PriSection id="research-narrative">
        <PriEyebrow>First-Hand Account</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">I Sat Ibogaine at The Mission Within</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          I sat Ibogaine at The Mission Within in Baja California alongside Navy SEALs. Men trained to feel nothing wept. Men who had spent years cycling
          through VA medications, residential rehab, and every approved protocol the United States government offers — undone and rebuilt by a molecule in
          a single night.
        </p>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          That is not anecdote. That is an 88% PTSD symptom reduction at one month, published in <em>Nature Medicine</em> by Stanford University in January
          2024. That is 80% of participants at The Mission Within no longer meeting diagnostic criteria for PTSD — across 1,200 veterans. That is the most
          significant psychiatric intervention data in a generation, happening 90 minutes south of the US border because the US government still
          classifies this plant as having &ldquo;no accepted medical use.&rdquo;
        </p>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          If you&apos;re here because you or someone you love is suffering and nothing has worked — you&apos;re in the right place. If you&apos;re here
          because you&apos;re curious about the most interesting molecule in neuropharmacology — also the right place.
        </p>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          This section will tell you what ibogaine actually is, what the research actually shows, which facilities are worth your life, and which ones you
          should run from. Then the Iboga Compass below will match you to the right path for your specific situation — or tell you clearly if ibogaine
          isn&apos;t right for you at all.
        </p>
        <p className="mb-8 max-w-200 text-[1.05rem] leading-[1.75] font-bold text-pri-brown">No paid placements. No ads. No bullshit.</p>

        <PriEyebrow>The Numbers</PriEyebrow>
        <h3 className="mb-4 font-heading font-extrabold text-[clamp(1.3rem,3vw,1.8rem)] text-pri-ink">Updated Research Data (2024–2026)</h3>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-162.5 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Condition</th>
                <th className={thClass}>Result</th>
                <th className={thClass}>Source</th>
              </tr>
            </thead>
            <tbody>
              {UPDATED_RESEARCH.map((r, i) => (
                <tr key={r.condition} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} font-semibold`}>{r.condition}</td>
                  <td className={`${tdClass} font-mono font-extrabold text-[#836311]`}>{r.result}</td>
                  <td className={`${tdClass} text-[.85rem] opacity-75`}>{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded-md border-l-4 border-[#E65100] bg-[#FFF3E0] p-5">
          <p className="m-0 mb-1 font-bold text-[#C24400]">Honest Limitations</p>
          <p className="m-0 text-[1.05rem] leading-[1.75] text-pri-brown">
            Most studies are observational, not randomized controlled trials. Sample sizes are small. Ibogaine is not FDA-approved. The Research Square
            2026 study — 19,071 patients — is the largest safety analysis to date. Six deaths, all in opioid-use-disorder patients at under-resourced
            settings. Zero in non-SUD patients under proper protocols. <strong>Proper protocols. That phrase is doing enormous work.</strong>
          </p>
        </div>
      </PriSection>

      {/* ── HARD STOPS ── */}
      <PriSection id="contraindications" dark>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#E57373] uppercase">
          <span className="block h-0.5 w-6 bg-[#E57373]" />
          Hard Stops
        </div>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">Who Should Not Do This</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          These are absolute contraindications. Not risk factors to manage. Hard stops. If any apply, ibogaine is not your path right now.
        </p>

        <h3 className="mb-3 font-heading font-extrabold text-xl text-[#E57373]">Cardiac — Non-Negotiable</h3>
        <ul className="mb-6 list-disc space-y-2 pl-6 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          <li>
            <strong>Long QT Syndrome or QTc above 450ms on any EKG.</strong> In a 14-patient Dutch clinical study, 50% reached QTc above 500ms during
            treatment. Every known ibogaine fatality has involved either an undetected cardiac condition or inadequate monitoring.
          </li>
          <li>
            <strong>Diagnosed heart disease, arrhythmia, Brugada syndrome, or history of cardiac events.</strong>
          </li>
          <li>
            <strong>Family history of sudden cardiac death under 50 or known inherited Long QT.</strong>
          </li>
        </ul>
        <div className="mb-6 rounded-md border-l-4 border-[#E57373] bg-[#C62828]/12 p-5">
          <p className="m-0 text-[1.05rem] leading-[1.75] text-pri-cream/80">
            Any clinic that will take you without a 12-lead EKG reviewed by a physician is telling you something important about their standards.
          </p>
        </div>

        <h3 className="mb-3 font-heading font-extrabold text-xl text-[#E57373]">Medical</h3>
        <ul className="mb-6 list-disc space-y-2 pl-6 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          <li>
            <strong>Severe liver disease or liver enzymes above 2.5× normal.</strong> Ibogaine is metabolized via CYP450-2D6. Compromised liver means
            dangerous accumulation.
          </li>
          <li>
            <strong>Uncontrolled seizure disorder.</strong> Ibogaine doesn&apos;t cause seizures. But seizures during treatment can trigger fatal
            arrhythmias.
          </li>
          <li>
            <strong>Pregnancy or breastfeeding.</strong>
          </li>
        </ul>

        <h3 className="mb-3 font-heading font-extrabold text-xl text-[#E57373]">Psychiatric</h3>
        <ul className="mb-6 list-disc pl-6 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          <li>
            <strong>Active psychosis. Acute bipolar mania. Schizophrenia or schizoaffective disorder (active).</strong> Ibogaine is an oneirogen — a waking
            dream lasting 8–20 hours. In a stable person this is transformative. In an actively psychotic person this is dangerous.
          </li>
        </ul>

        <h3 className="mt-8 mb-3 font-heading font-extrabold text-xl text-[#FFB74D]">The Medications Problem</h3>
        <p className="mb-4 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">Most people reading this have more preparation work to do than they realize.</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          <div className="rounded-lg border border-[#E57373]/30 bg-[#C62828]/10 p-4">
            <p className="m-0 mb-2 font-extrabold text-[#E57373]">Hard stops — physician clearance required</p>
            <ul className="m-0 list-disc space-y-1 pl-5 text-[.9rem] leading-[1.75] text-pri-cream/80">
              <li>MAO inhibitors (MAOIs) — serious serotonin syndrome risk. Weeks of washout.</li>
              <li>QT-prolonging medications — certain antipsychotics, antibiotics, anti-nausea drugs.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#FFB74D]/30 bg-[#FFB74D]/10 p-4">
            <p className="m-0 mb-2 font-extrabold text-[#FFB74D]">Supervised medical taper required</p>
            <ul className="m-0 list-disc space-y-1 pl-5 text-[.9rem] leading-[1.75] text-pri-cream/80">
              <li>SSRIs — 2–6 weeks (fluoxetine requires 5–6 weeks)</li>
              <li>Methadone — 4–6 weeks supervised transition</li>
              <li>Buprenorphine/Suboxone — supervised taper</li>
              <li>Benzodiazepines — abrupt stop triggers seizures</li>
              <li>Daily alcohol — same seizure risk</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-[.9rem] leading-[1.6] text-pri-cream/70">
          Also avoid: grapefruit (72 hours before), St. John&apos;s Wort (2 weeks before), quinine/tonic water (prolongs QT — avoid completely).{" "}
          <strong>Full medication disclosure to your treatment team is non-negotiable. Undisclosed drug interactions are how people die.</strong>
        </p>
      </PriSection>

      {/* ── FACILITIES ── */}
      <PriSection id="facilities">
        <PriEyebrow>The Facilities</PriEyebrow>
        <h2 className="mb-6 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">Who&apos;s Doing It Right</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          Twenty-two years of due diligence across $10 billion in restructured deals taught me one thing: the difference between a good deal and a
          catastrophic one is almost always the quality of the people managing it, not the underlying asset. Same principle applies here. The medicine is
          not the variable. The setting is.
        </p>
        <p className="mb-8 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          Every facility listed below is verified from their public website and independent directories as of June 2026. Two that appeared on earlier
          versions of this list have been removed — I&apos;ll tell you why.
        </p>

        {FEATURED_FACILITIES.map((f) => (
          <div key={f.name} className="mb-10 border-b border-pri-border pb-10">
            <div className="mb-3 flex flex-wrap items-start gap-4">
              <div>
                <h3 className="mb-1 flex items-center gap-2 font-heading font-extrabold text-xl text-pri-ink">
                  {f.star && <Star className="size-4 text-[#D4B96A]" fill="currentColor" />} {f.name}
                </h3>
                <p className="m-0 text-[.9rem] text-[#6B5A4E]">
                  {f.location}
                  {f.focus && ` | ${f.focus}`} |{" "}
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#836311] underline underline-offset-2">
                    {f.url.replace("https://", "")}
                  </a>{" "}
                  | {f.pricing}
                </p>
              </div>
            </div>
            <p className="mb-3 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">{f.body}</p>
            <p className="text-[.9rem] text-[#6B5A4E]">
              <strong>Who it&apos;s for:</strong> {f.who}
            </p>
            {f.partners && (
              <p className="text-[.9rem] text-[#6B5A4E]">
                <strong>Partners:</strong> {f.partners}
              </p>
            )}
          </div>
        ))}

        <h3 className="mt-8 mb-4 font-heading font-extrabold text-xl text-pri-ink">Additional Verified Facilities</h3>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-150 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Facility</th>
                <th className={thClass}>Location</th>
                <th className={thClass}>Focus</th>
                <th className={thClass}>Website</th>
              </tr>
            </thead>
            <tbody>
              {ADDITIONAL_FACILITIES.map((r, i) => (
                <tr key={r.name} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} font-bold`}>{r.name}</td>
                  <td className={tdClass}>{r.location}</td>
                  <td className={tdClass}>{r.focus}</td>
                  <td className={tdClass}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#836311]">
                      {r.url.replace("https://", "")}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-l-4 border-[#581C87] bg-[#F3E8FF] p-5">
          <p className="m-0 mb-2 font-extrabold text-[#581C87]">Two Facilities No Longer on This List</p>
          <p className="m-0 mb-2 text-[1.05rem] leading-[1.75] text-pri-brown">
            <strong>Ibogaine by David Dardashti</strong> — Removed. Multiple independently documented reviews describe unsafe conditions, absent medical
            oversight, threatened clients, and alleged misrepresentation. Do not go here.
          </p>
          <p className="m-0 text-[1.05rem] leading-[1.75] text-pri-brown">
            <strong>Crossroads Treatment Center</strong> — Removed. Permanently closed 2025.
          </p>
        </div>

        <h3 className="mt-8 mb-4 font-heading font-extrabold text-xl text-pri-ink">Quick Reference</h3>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-175 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Facility</th>
                <th className={thClass}>Location</th>
                <th className={thClass}>Travel Level</th>
                <th className={thClass}>Veteran</th>
                <th className={thClass}>Nagoya</th>
                <th className={thClass}>Pricing</th>
              </tr>
            </thead>
            <tbody>
              {QUICK_REFERENCE.map((r, i) => (
                <tr key={r.name} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} font-bold`}>{r.name}</td>
                  <td className={tdClass}>{r.loc}</td>
                  <td className={`${tdClass} ${r.travel.includes("3") ? "text-[#E65100]" : r.travel.includes("2") ? "text-[#836311]" : ""}`}>{r.travel}</td>
                  <td className={tdClass}>
                    {r.primary ? (
                      <span className="inline-flex items-center gap-1">
                        <Star aria-hidden="true" className="size-4 text-[#D4B96A]" fill="currentColor" />
                        {r.vet}
                      </span>
                    ) : (
                      r.vet
                    )}
                  </td>
                  <td className={tdClass}>{r.nagoya}</td>
                  <td className={`${tdClass} font-mono`}>{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PriSection>

      {/* ── EXTRACTIVE CAPITALISM ── */}
      <PriSection id="extractive-capitalism" dark>
        <PriEyebrow>The Extractive Capitalism Problem</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">Who Benefits From This Plant?</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          Of the seven biggest companies currently developing ibogaine as a pharmaceutical, none had made any public mention of following the Nagoya
          Protocol at the time of my research. The Nagoya Protocol governs access to genetic resources and traditional knowledge from indigenous
          communities. Gabon was the first country in the world to sign it.
        </p>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          What this means in plain English: Western pharmaceutical companies are taking a plant that Gabonese communities have stewarded for centuries,
          extracting the active compound, patenting novel formulations, and building businesses worth hundreds of millions of dollars — without returning
          anything meaningful to the people whose knowledge made this possible.
        </p>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          Ambio Life Sciences is the only ibogaine clinic in the world that is Nagoya-compliant. Beōnd plants three iboga trees in Gabon per treatment.
          These are not marketing claims — they are structural positions that should be part of your facility selection criteria.
        </p>
        <p className="mb-8 max-w-200 text-[1.05rem] leading-[1.75] text-pri-cream/80">
          This is the core of ImpactSoul&apos;s thesis: regenerative capital heals. Extractive capital destroys. Ibogaine is the most literal test of that
          proposition I have encountered.
        </p>
        <Link href="https://tonygreenberg.com/blog/psychedelics-could-become-extractive-capitalism" className="inline-flex items-center gap-1.5 rounded-md bg-[#D4B96A] px-8 py-3 font-bold text-pri-ink">
          Read the Full Argument
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </PriSection>

      {/* ── US LEGAL STATUS ── */}
      <PriSection id="legal-status">
        <PriEyebrow>US Legal Status (2026)</PriEyebrow>
        <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-ink">The Regulatory Landscape</h2>
        <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
          Ibogaine is Schedule I in the United States. US and Canadian citizens traveling to Mexico for treatment face zero domestic legal consequences.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {LEGAL_STATUS_ITEMS.map((item) => (
            <div key={item.label} className="rounded-lg border border-pri-border bg-pri-parchment p-4">
              <p className="m-0 mb-1.5 text-[.95rem] font-bold text-pri-ink">{item.label}</p>
              <p className="m-0 text-[.9rem] leading-[1.6] text-pri-brown">{item.detail}</p>
            </div>
          ))}
        </div>
      </PriSection>

      {/* ── IBOGA COMPASS ASSESSMENT v2 ── */}
      <IbogaCompassSection />

      {/* ── SOURCES ── */}
      <PriSection id="sources">
        <PriEyebrow>Sources &amp; References</PriEyebrow>
        <h2 className="mb-6 font-heading font-extrabold text-[clamp(1.4rem,3vw,2rem)] text-pri-ink">Peer-Reviewed Literature</h2>
        <ol className="max-w-200 list-decimal space-y-2 pl-6">
          {IBOGA_SOURCES.map((s) => (
            <li key={s} className="text-[.95rem] text-pri-brown">
              {s}
            </li>
          ))}
        </ol>
      </PriSection>

      {/* ── DISCLAIMER ── */}
      <section className="bg-pri-ink px-5 py-8">
        <div className="mx-auto max-w-225">
          <div className="border-l-4 border-[#581C87] bg-[#F3E8FF] p-5">
            <p className="m-0 mb-2 flex items-center gap-1.5 text-base font-extrabold text-[#581C87]">
              <AlertTriangle className="size-4" />
              Critical Safety Notice
            </p>
            <p className="m-0 text-[.95rem] leading-[1.75] text-pri-brown">{IBOGA_DISCLAIMER}</p>
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-md bg-[#D4B96A] px-8 py-3 font-bold text-pri-ink">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Return to Psychedelic Readiness Index
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
