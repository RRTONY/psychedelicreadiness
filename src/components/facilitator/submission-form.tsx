"use client";

import { useState } from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitFacilitatorIndex } from "@/app/forms/actions";
import { FormError, mailtoHref } from "@/components/forms/form-error";

const CONTACT_EMAIL = "tony@tonygreenberg.com";

// Ported from legacy's `SubmissionForm` — the real "paste your completed
// 108-item responses" intake, including the optional referral-consent
// fields, unchanged. Since 2026-10-10 it saves to Supabase
// (`submitFacilitatorIndex` in src/app/forms/actions.ts →
// facilitator_submissions, kind 'full') and emails Tony, like legacy's
// `trpc.facilitatorIndex.submit`. If saving fails, the error offers a
// pre-filled email to Tony instead, so no responses are lost.
const schema = Yup.object({
  codedIdentity: Yup.string().trim().max(128),
  responses: Yup.string().trim().max(50000).required("Paste your responses first."),
  referralConsent: Yup.boolean(),
  referralRegion: Yup.string().trim().max(256),
  referralContact: Yup.string().trim().max(512),
});

type Values = Yup.InferType<typeof schema>;

const INPUT = "mb-5 w-full rounded-md border border-facilitator-amber-light/35 bg-white/85 px-3.5 py-2.5 text-[.92rem] text-facilitator-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";
const LABEL = "mb-1.5 block text-xs font-bold tracking-[0.08em] text-facilitator-ink/60 uppercase";

export function SubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState("");

  if (submitted) {
    return (
      <div className="rounded-lg border border-facilitator-amber-light/35 bg-facilitator-amber-light/12 p-6 text-center text-facilitator-amber">
        <CheckCircle2 className="mx-auto mb-2 size-7" />
        <div className="mb-1.5 font-bold">Received.</div>
        <div className="text-[.88rem] text-facilitator-ink/60">
          Your responses are logged under your code. They appear in aggregate findings only, unless you marked items publishable. The Reciprocity Gate
          improvements will be reviewed and credited by code in v1.1.
        </div>
      </div>
    );
  }

  return (
    <Formik<Values>
      initialValues={{ codedIdentity: "", responses: "", referralConsent: false, referralRegion: "", referralContact: "" }}
      validationSchema={schema}
      onSubmit={async (v) => {
        setError(null);
        const res = await submitFacilitatorIndex({
          kind: "full",
          codedIdentity: v.codedIdentity,
          responses: v.responses,
          referralConsent: v.referralConsent,
          referralRegion: v.referralConsent ? v.referralRegion : "",
          referralContact: v.referralConsent ? v.referralContact : "",
          locale: typeof navigator !== "undefined" ? navigator.language : undefined,
        }).catch(() => ({ ok: false, error: "This couldn't be saved just now." }));
        if (res.ok) return setSubmitted(true);
        setError(res.error ?? "Something went wrong.");
        setFallback(
          mailtoHref(CONTACT_EMAIL, "Facilitator Index Submission", [
            v.codedIdentity?.trim() && `Code: ${v.codedIdentity.trim()}`,
            v.referralConsent && "Referral introduction requested: yes",
            v.referralConsent && v.referralRegion?.trim() && `Region: ${v.referralRegion.trim()}`,
            v.referralConsent && v.referralContact?.trim() && `Contact: ${v.referralContact.trim()}`,
            "",
            "RESPONSES",
            "",
            v.responses.trim(),
          ]),
        );
      }}
    >
      {({ isSubmitting, values }) => (
        <Form noValidate>
          <div>
            <label htmlFor="fi-code" className={LABEL}>Your Code (optional)</label>
            <Field id="fi-code" type="text" name="codedIdentity" placeholder="e.g. CEDAR-001" maxLength={128} className={INPUT} />
          </div>
          <div>
            <label htmlFor="fi-responses" className={LABEL}>Your Responses — paste all 108 items with your answers</label>
            <Field
              as="textarea"
              id="fi-responses"
              name="responses"
              placeholder="Paste your completed responses here. Format: item number, your answer. One item per line or however you've organized them."
              required
              className="mb-5 min-h-60 w-full resize-y rounded-md border border-facilitator-amber-light/35 bg-white/85 px-3.5 py-2.5 text-[.92rem] text-facilitator-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="mb-5">
            <label className="flex cursor-pointer items-start gap-3">
              <Field type="checkbox" name="referralConsent" className="mt-0.5 accent-facilitator-amber-light" />
              <span className="text-[.88rem] leading-[1.55] text-facilitator-ink/70">
                I&apos;d like Tony to make a personal introduction to a vetted practitioner or facility in my region when relevant. This is not a
                lead-generation list. Tony reviews these himself.
              </span>
            </label>
          </div>

          {values.referralConsent && (
            <>
              <div>
                <label htmlFor="fi-region" className={LABEL}>Your Region</label>
                <Field id="fi-region" type="text" name="referralRegion" placeholder="e.g. Pacific Northwest, Western Europe, Southeast Asia" maxLength={256} className={INPUT} />
              </div>
              <div>
                <label htmlFor="fi-contact" className={LABEL}>How to reach you (email or Signal)</label>
                <Field id="fi-contact" type="text" name="referralContact" placeholder="Contact info for Tony only — never published" maxLength={512} className={INPUT} />
              </div>
            </>
          )}

          {error && <FormError error={error} mailto={fallback} className="mb-4 text-[.88rem] text-facilitator-ink" />}

          <button
            type="submit"
            disabled={!values.responses.trim() || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-facilitator-amber-deep to-facilitator-amber-light px-10 py-3.5 text-sm font-bold tracking-[0.06em] text-facilitator-ink uppercase disabled:opacity-50"
          >
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            Submit to the Index
          </button>
        </Form>
      )}
    </Formik>
  );
}
