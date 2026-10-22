"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FACILITATOR_BANDS, FACILITATOR_BANDS_IMAGE, FACILITATOR_COMPASS_IMAGE } from "@/lib/content/facilitator-index-data";
import { QuickIntake } from "@/components/facilitator/quick-intake";
import { SubmissionForm } from "@/components/facilitator/submission-form";
import { PrintQuestionsButton } from "@/components/facilitator/print-questions-button";
import { FacilitatorShareBar } from "@/components/facilitator/share-bar";


function Item({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-start gap-4">
      <span className="min-w-8 shrink-0 pt-0.5 text-[clamp(.75rem,1.8vw,.82rem)] font-bold tracking-[0.04em] text-facilitator-amber-deep">{n}.</span>
      <span className="text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.7] text-facilitator-ink">{children}</span>
    </div>
  );
}

function Trad({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-start gap-4 pl-6">
      <span className="min-w-6 shrink-0 pt-0.5 text-[.68rem] font-bold text-facilitator-amber-deep/75">{n}.</span>
      <span className="text-[.88rem] leading-[1.6] text-facilitator-ink/82">{children}</span>
    </div>
  );
}

// Ported from legacy client/src/pages/pri/FacilitatorIndex.tsx — see that
// file's port note in NEXTJS-MIGRATION-TODO.md for the full list of what
// changed. This client island holds the one piece of real page state
// (`showFullIndex`) plus mounts the QuickIntake archetype quiz and the
// submission form.
export function FacilitatorIndexContent() {
  const [showFullIndex, setShowFullIndex] = useState(false);

  return (
    <div className="mx-auto max-w-200 px-4 py-12 sm:px-8">
      <div className="mb-6 rounded-lg border border-facilitator-amber-light/18 border-l-3 border-l-facilitator-amber-deep bg-facilitator-amber-deep/6 px-6 py-4">
        <p className="m-0 text-[clamp(.88rem,2.2vw,1rem)] leading-[1.75] text-facilitator-ink/75">
          The field has no shared standard. No agreed definition of adequate preparation, adequate screening, or adequate integration. What you find here
          is the beginning of one — built from what practitioners actually believe, not what they&apos;re willing to put their name on.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-facilitator-amber-light/28 bg-white/82 p-6 shadow-[0_8px_32px_rgba(180,120,0,0.12),0_2px_8px_rgba(0,0,0,.06)] backdrop-blur-2xl sm:p-8">
        <QuickIntake onGoDeeper={() => setShowFullIndex(true)} />
      </div>

      {!showFullIndex && (
        <div className="mb-10 flex flex-wrap justify-center gap-3 text-center">
          <blockquote className="m-0 mb-6 w-full rounded-r-lg border-l-3 border-facilitator-amber-deep bg-white/60 px-6 py-5 text-left font-heading text-[clamp(.95rem,2.5vw,1.1rem)] leading-[1.75] text-facilitator-ink italic">
            &ldquo;What a practitioner believes should happen, what they consider a failure, how many people they think one human being can hold in a
            year — will tell you more about who they are than any inventory of what they did last spring.&rdquo;
            <footer className="mt-3 font-body text-xs font-normal tracking-[0.1em] text-facilitator-ink/45 uppercase not-italic">— From the instrument rationale</footer>
          </blockquote>
          <button onClick={() => setShowFullIndex(true)} className="rounded-lg border border-facilitator-amber-light/25 px-6 py-2.5 text-[.82rem] tracking-[0.06em] text-facilitator-amber-deep/70">
            Read the full instrument ↓
          </button>
          <PrintQuestionsButton label="Print / Save as PDF" />
        </div>
      )}

      {showFullIndex && (
        <>
          <div className="mb-4 text-right">
            <PrintQuestionsButton label="Print All 108 Questions" />
          </div>

          <div className="mb-8 rounded-2xl border border-facilitator-amber-light/28 bg-white/82 p-6 shadow-[0_8px_32px_rgba(180,120,0,0.12),0_2px_8px_rgba(0,0,0,.06)] backdrop-blur-2xl sm:p-8">
            <p className="mb-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">Know Before You Go asked the seeker whether they were ready.</p>
            <p className="m-0 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">Know Who You Go With asks the practitioner what they believe.</p>
          </div>

          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">Read This Before Anything Else</div>
          <div className="mb-8 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>This instrument does not ask what you have done.</p>
            <p>
              Not once. Not obliquely. Not in a free-text box where you might volunteer it. Every one of the 108 items below asks about belief, knowledge,
              judgment, or preference. There is no item anywhere in this document that asks you to describe your own conduct, name a participant, name a
              place, name a date, or confirm that any event occurred.
            </p>
            <p>
              That is a design decision, not a courtesy. A survey of practitioners that asks about practice produces a document that is dangerous to the
              people who complete it honestly. The published research on this population says so directly. One recent study of psychedelic facilitators
              interpreted its own low response rate as evidence that only a small share of working practitioners felt safe answering questions about their
              personal experience, even anonymously, and observed that the field cannot understand how lived experience shapes competency if
              professionals do not feel safe discussing it.
            </p>
            <p>So we stopped asking.</p>
            <p>
              What follows measures judgment instead of activity. It turns out judgment is the better measurement anyway. What a practitioner believes
              should happen, what they consider a failure, how many people they think one human being can hold in a year, and how they assess a
              stranger&apos;s handling of a hard moment will tell you more about who they are than any inventory of what they did last spring.
            </p>
          </div>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">What This Is For</div>
          <div className="mb-8 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>Four outputs, in order of importance.</p>
            <p>
              A standard. There is no shared definition of adequate preparation, adequate integration, adequate screening, or adequate confidentiality in
              this field. Two hundred and fifty considered opinions is the beginning of one.
            </p>
            <p>
              A map. Practitioners see where they sit relative to a cohort they have never been able to see. Solemn or celebratory. Spirit or mechanism.
              Emergent or protocolized.
            </p>
            <p>
              A referral network. Facilitators who can see who thinks like them, and more usefully who does not, can refer with more precision than the
              current system, which is whispered names.
            </p>
            <p>
              A public record of contribution. Every improvement submitted through the Reciprocity Gate is logged, dated, and credited to a code.
              Contribution becomes ledger-able without exposure.
            </p>
            <p>
              That last one is the reason this exists at all. In most fields, reputation accrues to a name. Here, a name is a liability, so reputation has
              nowhere to go and the field cannot compound its own trust. Give the accrual a place to land that is not a name, and duration starts to mean
              something — time on a ledger rather than time in a rumor.
            </p>
          </div>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">Your Code</div>
          <div className="mb-4 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>
              You have been assigned a code in the form{" "}
              <span className="rounded-sm border border-facilitator-amber-light/35 bg-facilitator-amber-light/12 px-2 py-0.5 font-mono text-[.85rem] text-facilitator-amber">CEDAR-001</span>. A nature word and an
              ordinal. Speakable in a circle without outing anyone.
            </p>
            <p>
              Your code is the only key to your responses. It is generated in your browser, displayed once, and never stored anywhere in a form we can
              read. If you lose it, we cannot recover it, cannot look it up, and cannot help you. That is not a limitation we regret. It is the feature.
            </p>
          </div>
          <div className="mb-3 font-heading text-base font-bold text-facilitator-ink">Three tiers, changeable at any time, in one click, without explanation</div>
          <div className="mb-2 border-l-2 border-facilitator-amber-light/40 pl-4">
            <div className="mb-0.5 text-[.78rem] font-bold tracking-[0.06em] text-facilitator-amber-deep uppercase">Sealed</div>
            <div className="text-[.88rem] leading-[1.55] text-facilitator-ink/70">You appear in aggregate statistics only. No public page exists for you.</div>
          </div>
          <div className="mb-2 border-l-2 border-facilitator-amber-light/40 pl-4">
            <div className="mb-0.5 text-[.78rem] font-bold tracking-[0.06em] text-facilitator-amber-deep uppercase">Coded</div>
            <div className="text-[.88rem] leading-[1.55] text-facilitator-ink/70">A public profile exists under your code word. No name, no photograph, no location finer than continent.</div>
          </div>
          <div className="mb-4 border-l-2 border-facilitator-amber-light/40 pl-4">
            <div className="mb-0.5 text-[.78rem] font-bold tracking-[0.06em] text-facilitator-amber-deep uppercase">Named</div>
            <div className="text-[.88rem] leading-[1.55] text-facilitator-ink/70">A full public profile with contact details, for practitioners operating in sanctioned frameworks who want to be found.</div>
          </div>
          <p className="mb-8 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">Moving from Named back to Sealed is permanent, immediate, and requires no conversation with us.</p>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">What We Hold, What We Cannot Hold, What Never Existed</div>
          <div className="mb-10 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>Held: your numeric responses and your free-text answers, attached to your code, on infrastructure we control.</p>
            <p>
              Held as ciphertext only: every field you mark private. Encrypted in your browser under a key derived from your code. We hold the ciphertext.
              We cannot decrypt it. We cannot be compelled to produce what we cannot read.
            </p>
            <p>
              Never collected: your name, unless you choose Named. Your email, ever. Your IP address. Any analytics identifier. There are no third-party
              scripts on the form page.
            </p>
            <p>Never existed: any list of people you have worked with. See the Corroboration section for why this matters and how it is handled.</p>
            <p>
              What we cannot promise: that your own device, browser history, or the channel through which you received this invitation is clean. We
              control our side completely and yours not at all. Use a device you trust.
            </p>
          </div>

          <Image
            src={FACILITATOR_BANDS_IMAGE}
            alt="Twelve etched glass panes of decreasing size, one for each band of the instrument"
            width={1200}
            height={805}
            sizes="(min-width: 768px) 720px, 100vw"
            className="my-8 h-auto w-full rounded-lg"
          />

          {/* All 12 bands */}
          {FACILITATOR_BANDS.map((band) => (
            <div key={band.id}>
              <span className="mb-1 block text-xs font-bold tracking-[0.18em] text-facilitator-amber-deep uppercase">{band.label}</span>
              <div className="mb-1 font-heading text-[clamp(1.3rem,3.5vw,1.6rem)] font-bold text-facilitator-ink">{band.title}</div>
              {band.note && <div className="mb-6 text-[clamp(.88rem,2vw,.95rem)] leading-[1.6] text-facilitator-ink/65">{band.note}</div>}
              {!band.note && <div className="mb-4" />}

              {band.traditions && (
                <>
                  <div className="mb-3 grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 pl-6 text-[.7rem] tracking-[0.06em] text-facilitator-ink/50 uppercase">
                    <span>Familiarity 0–5</span>
                    <span>Emotional resonance 1–10</span>
                    <span>Spiritual resonance 1–10</span>
                    <span>Practice influence 1–10</span>
                    <span>Closed to me</span>
                  </div>
                  <p className="mb-4 text-[.82rem] leading-[1.7] text-facilitator-ink/85">
                    Familiarity: 0 never heard of it, 1 heard of it, 2 read about it, 3 studied it seriously, 4 trained in it, 5 hold it as lineage. Fifth
                    option on every row: Closed to me. Some of these are living traditions with membership, initiation, and obligation attached. If a row
                    is not yours to rate, mark it closed and move on. That answer is recorded as a finding rather than a gap, and how often it gets used
                    is one of the more interesting things this instrument will learn.
                  </p>
                  {band.traditions.map((t) => (
                    <Trad key={t.n} n={t.n}>
                      {t.text}
                    </Trad>
                  ))}
                </>
              )}

              {band.id === "band-d" && (
                <div className="mt-4 mb-2 rounded-lg border border-facilitator-amber-light/25 bg-facilitator-amber-light/8 px-5 py-4 text-[.85rem] leading-[1.6] text-facilitator-ink/65">
                  Visual output. Frame on the horizontal, structure on the vertical, register as dot color, policy as dot size. Four dimensions in one
                  plot, with your dot bright against the grey cloud of the cohort, and percentile bands on each axis. Toggle to see only practitioners
                  within a chosen radius of your own position. That view is the referral network hiding inside the dataset.
                </div>
              )}

              {band.id === "band-k" && (
                <p className="mb-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
                  You are not being surveyed. You are being asked to co-author the instrument that will describe you. That is the trade, and it is the
                  only payment on offer.
                </p>
              )}

              {band.items.map((item) => (
                <Item key={item.n} n={item.n}>
                  {item.text}
                </Item>
              ))}

              {band.id === "band-j" && (
                <Image
                  src={FACILITATOR_COMPASS_IMAGE}
                  alt="The five-axis map: a crystal star etched with geometry, casting five colored beams"
                  width={1200}
                  height={1200}
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="mt-8 h-auto w-full rounded-lg"
                />
              )}

              <hr className="my-8 border-facilitator-amber-deep/15" />
            </div>
          ))}

          {/* Reciprocity Gate follow-up */}
          <div className="mb-3 font-heading text-base font-bold text-facilitator-ink">How improvements are codified</div>
          <div className="mb-10 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>
              Every improvement receives an identifier tied to your code, in the form{" "}
              <span className="rounded-sm border border-facilitator-amber-light/35 bg-facilitator-amber-light/12 px-2 py-0.5 font-mono text-[.85rem] text-facilitator-amber">CEDAR-001-I3</span>. Adopted improvements
              appear in a public, dated changelog on this page, credited to the code. Return at any time, search your code, and see your line in the
              instrument&apos;s history.
            </p>
            <p>Version 1.0 ships with 250 practitioners&apos; names absent and their fingerprints everywhere. Version 1.1 will name which codes moved which items.</p>
            <p>Improvements are marked adopted or not adopted. They are never scored, ranked, or graded. The moment a practitioner suspects their five are being marked, they write to impress instead of to fix.</p>
          </div>

          {/* Corroboration follow-up */}
          <div className="mb-3 font-heading text-base font-bold text-facilitator-ink">How it works</div>
          <div className="mb-5 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>
              On completion you are offered three opaque single-use tokens. Long random strings. There is no email field anywhere in this flow. We do not
              send anything. You copy the tokens and deliver them however you choose, to whomever you choose, or to nobody.
            </p>
            <p>We never learn who was contacted, how many were contacted, whether they were participants, or whether the tokens were used at all.</p>
            <p className="text-[.82rem] leading-[1.7] text-facilitator-ink/70">
              A note on why a passphrase rather than a name. A name has low entropy, so a hash of a name can be guessed by anyone holding a list of
              candidate names. A passphrase you choose is far stronger and proves the same thing, which is that whoever is answering genuinely knows you.
              If you want name entry as well, the name is checked and discarded immediately, and the passphrase carries the actual security.
            </p>
          </div>
          <div className="mb-3 font-heading text-base font-bold text-facilitator-ink">What the token holder is asked</div>
          <p className="mb-8 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            No date. No place. No substance. No description of any event. Every one of these can be answered truthfully by someone who has only ever
            spoken with the practitioner. Nothing here is a witness statement.
          </p>
          <div className="mb-3 font-heading text-base font-bold text-facilitator-ink">Deleted, retained, never existed</div>
          <div className="mb-8 space-y-3 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>Deleted on submit, immediately, not on a nightly job: the token, the passphrase entry, the name if used, any session identifier.</p>
            <p>Retained: six numbers and one short string, attached to your code, with no link back to who wrote them.</p>
            <p>Never existed: any email address, any recipient list, any send record.</p>
          </div>
          <div className="mb-3 font-heading text-base font-bold text-facilitator-ink">The word we do not use</div>
          <div className="mb-10 space-y-4 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <p>
              Not verified. A practitioner could open three private windows and corroborate themselves in ninety seconds. There is no defense against
              that which does not require identity, and identity is precisely what this instrument refuses to collect. So the label is Corroborated, the
              limitation is printed beside it wherever it appears, and it is never presented as proof.
            </p>
            <p>
              Absence is never a negative. A practitioner working with people in genuinely sensitive circumstances should be contacting nobody.
              Corroboration displays as present or absent. It is never a score component and never sortable.
            </p>
            <p>Three tokens, permanently. Not three per submission. Unlimited tokens would turn a trust signal into a marketing funnel inside a month.</p>
          </div>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          {/* Submission Form */}
          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">Submit Your Responses</div>
          <p className="mb-6 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            Complete the 108 items above, then paste your responses below. Your code is the only identifier. Nothing else is collected.
          </p>
          <div className="mb-10 rounded-2xl border border-facilitator-amber-light/28 bg-white/82 p-6 shadow-[0_8px_32px_rgba(180,120,0,0.12),0_2px_8px_rgba(0,0,0,.06)] backdrop-blur-2xl sm:p-8">
            <SubmissionForm />
          </div>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          {/* Changelog */}
          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">Changelog</div>
          <div className="mb-2 text-[.88rem] leading-[1.55] text-facilitator-ink/55">v1.0, Pilot. 108 items across twelve bands. Cohort target 250 by invitation.</div>
          <div className="mb-10 text-[.88rem] leading-[1.55] text-facilitator-ink/55">v1.1, Pending. Will incorporate adopted improvements from the pilot cohort, credited by code.</div>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          {/* Medical and Legal Notice */}
          <div className="mb-10 rounded-lg border border-facilitator-amber-light/18 bg-facilitator-amber-light/6 px-6 py-5 text-[.82rem] leading-[1.65] text-facilitator-ink/55">
            <div className="mb-2 text-xs font-bold tracking-[0.1em] text-facilitator-ink/50 uppercase">Medical and Legal Notice</div>
            This page is an instrument for professional self-assessment and field research. It is educational in purpose. It is not medical advice, not
            legal advice, not a credential, not a certification, and not a verification of any person&apos;s competence, training, or fitness to
            practice.
            <br />
            <br />
            Nothing on this page should be read as encouragement to obtain, possess, administer, or use any controlled substance. Legal status varies
            enormously by jurisdiction and changes frequently. Practitioners are responsible for their own compliance and should consult counsel
            qualified in their own jurisdiction.
            <br />
            <br />
            Corroboration is not verification. Inclusion in this index is not endorsement.
            <br />
            <br />
            If you are in crisis: Fireside Project Psychedelic Support Line, SAMHSA National Helpline, 988 Suicide and Crisis Lifeline in the United
            States.
          </div>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          {/* Related */}
          <div className="mb-3 font-heading text-lg font-bold text-facilitator-ink">Related</div>
          <p className="mb-3 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <Link href="/" className="text-facilitator-amber-deep">
              Psychedelic Readiness Index
            </Link>{" "}
            — the companion instrument for seekers. Six domains, 39 medicines, hard-stop screening, medication interaction matrix.
          </p>
          <p className="mb-3 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <Link href="https://tonygreenberg.com/blog/only-time-buys-trust" className="text-facilitator-amber-deep">
              Only Time Buys Trust
            </Link>{" "}
            — why duration belongs on a balance sheet.
          </p>
          <p className="mb-10 text-[clamp(1rem,2.2vw,1.05rem)] leading-[1.75] text-facilitator-ink/85">
            <Link href="https://tonygreenberg.com/kava/caffeine" className="text-facilitator-amber-deep">
              Kava and caffeine
            </Link>{" "}
            — interaction notes on ceremonial preparation.
          </p>

          <hr className="my-10 border-facilitator-amber-deep/15" />

          {/* Licensing Notice */}
          <div className="mb-8 rounded-2xl border border-facilitator-amber-light/28 bg-white/82 p-8 text-center shadow-[0_8px_32px_rgba(180,120,0,0.12),0_2px_8px_rgba(0,0,0,.06)] backdrop-blur-2xl">
            <p className="mb-1.5 text-[.9rem] font-semibold text-facilitator-amber">© 2026 Tony Greenberg · All Rights Reserved · Patent Pending</p>
            <p className="mb-4 text-[.82rem] text-facilitator-ink/60">
              This instrument is protected intellectual property. Unauthorized reproduction, distribution, or derivative use is prohibited. Want to
              license it? All proceeds fund addiction recovery.
            </p>
            <a href="mailto:tony@tonygreenberg.com?subject=Facilitator%20Index%20Licensing" className="rounded-md border border-facilitator-amber-light/35 bg-facilitator-amber-light/15 px-5 py-1.5 text-[.85rem] text-facilitator-amber-deep">
              Inquire About Licensing
            </a>
          </div>

          <FacilitatorShareBar />

          {/* Copyright Footer */}
          <div className="mb-8 rounded-2xl border border-facilitator-amber-light/28 bg-white/82 p-6 text-center text-[.78rem] leading-[1.8] text-facilitator-ink/45 shadow-[0_8px_32px_rgba(180,120,0,0.12),0_2px_8px_rgba(0,0,0,.06)] backdrop-blur-2xl">
            <div className="mb-2 text-[.85rem] font-bold text-facilitator-ink/65">© 2026 Tony Greenberg. All Rights Reserved. Patent Pending. ™</div>
            <div>This instrument is proprietary intellectual property. Reproduction, distribution, or use without a license is prohibited.</div>
            <div className="mt-2">
              Want to license the Facilitator Index for your organization or platform?{" "}
              <a href="mailto:tony@tonygreenberg.com?subject=Facilitator Index License" className="text-facilitator-amber-deep underline">
                Contact Tony.
              </a>{" "}
              All licensing proceeds benefit addiction recovery programs.
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 border-t border-facilitator-ink/10 pt-8 text-[.82rem] leading-[1.6] text-facilitator-ink/45">
            Tony Greenberg is Founder and CEO of{" "}
            <a href="https://ramprate.com" className="text-facilitator-amber-deep">
              RampRate
            </a>{" "}
            and Founder of{" "}
            <a href="https://impactsoul.is" className="text-facilitator-amber-deep">
              ImpactSoul
            </a>
            . He is an investor in MycoMedica Life Sciences and holds six active investments in psychedelic medicine. Disclosure is the price of asking
            anyone else to be candid.
            <br />
            <br />
            ⁘
          </div>
        </>
      )}
    </div>
  );
}
