"use client";

import { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { MedicineWithSafety } from "@/lib/content/pri-data";
import { submitPriCorrection } from "@/app/forms/actions";
import { FormError, mailtoHref } from "@/components/forms/form-error";

const CONTACT_EMAIL = "tony@tonygreenberg.com";

const FIELD_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "therapeutic", label: "Therapeutic Applications" },
  { value: "tradition", label: "Tradition" },
  { value: "contraindications", label: "Contraindications" },
  { value: "sideEffects", label: "Side Effects" },
  { value: "drugInteractions", label: "Drug Interactions" },
  { value: "safetyWarning", label: "Safety Warning" },
  { value: "legalStatus", label: "Legal Status" },
  { value: "pricing", label: "Pricing / Access" },
  { value: "providers", label: "Providers" },
];

// Ported from legacy's `CorrectionForm` — the real community-correction
// intake for a medicine's data, unchanged. Since 2026-10-10 it saves to
// Supabase (`submitPriCorrection` in src/app/forms/actions.ts →
// pri_corrections) and emails Tony, like legacy's `trpc.pri.submitCorrection`.
// Legacy's error path showed a fake "Thank You" even when saving failed
// ("Still show success for UX"); here a failure shows the error and a
// pre-filled "email Tony directly" link instead, so nothing is lost.
const schema = Yup.object({
  fieldName: Yup.string().required(),
  suggestedContent: Yup.string().trim().max(5000, "Keep it under 5,000 characters.").required("Describe the correction first."),
  sourceUrl: Yup.string().trim().max(512).matches(/^https?:\/\/\S+$/i, { message: "Use a web address starting with http.", excludeEmptyString: true }),
  submitterName: Yup.string().trim().max(256),
  submitterEmail: Yup.string().trim().email("That email address doesn't look right.").max(320),
  website: Yup.string(),
});

type Values = Yup.InferType<typeof schema>;

// The section's current text, saved with the correction so Tony sees what it replaced.
function currentText(medicine: MedicineWithSafety, field: string): string {
  const v = (medicine as unknown as Record<string, unknown>)[field];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
  return "";
}

export function CorrectionForm({ medicine, onClose }: { medicine: MedicineWithSafety; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState("");

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-9 text-[#3D6B44]" />
        <h3 className="mb-2 font-heading text-[1.3rem] font-extrabold text-pri-ink">Thank You</h3>
        <p className="text-[.9rem] text-pri-tan">Your correction has been submitted for review. Tony and the community team will review it and update the data if appropriate.</p>
        <button onClick={onClose} className="mt-4 bg-pri-ink px-8 py-3 font-mono text-sm font-bold tracking-wide text-pri-cream uppercase">
          Close
        </button>
      </div>
    );
  }

  const inputClass = "w-full border border-pri-border bg-pri-parchment px-3.5 py-2.5 font-body text-[.88rem] text-pri-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const labelClass = "mb-1.5 block text-xs font-bold tracking-[0.08em] text-pri-tan uppercase";
  const errorClass = "mt-1 text-[.8rem] text-pri-purple";

  return (
    <div className="py-6">
      <h3 className="mb-1 font-heading text-[1.2rem] font-extrabold text-pri-ink">Suggest a Correction for {medicine.name}</h3>
      <p className="mb-5 text-[.82rem] leading-[1.6] text-pri-tan">
        Help us keep this data accurate. If you have clinical experience, published research, or verified information that improves our data, please share
        it below.
      </p>

      <Formik<Values>
        initialValues={{ fieldName: "overview", suggestedContent: "", sourceUrl: "", submitterName: "", submitterEmail: "", website: "" }}
        validationSchema={schema}
        onSubmit={async (v) => {
          setError(null);
          const fieldLabel = FIELD_OPTIONS.find((f) => f.value === v.fieldName)?.label ?? v.fieldName;
          const res = await submitPriCorrection({
            medicineId: medicine.id,
            medicineName: medicine.name,
            fieldName: v.fieldName,
            fieldLabel,
            currentContent: currentText(medicine, v.fieldName),
            suggestedContent: v.suggestedContent,
            sourceUrl: v.sourceUrl,
            submitterName: v.submitterName,
            submitterEmail: v.submitterEmail,
            website: v.website,
          }).catch(() => ({ ok: false, error: "This couldn't be saved just now." }));
          if (res.ok) return setSubmitted(true);
          setError(res.error ?? "Something went wrong.");
          setFallback(
            mailtoHref(CONTACT_EMAIL, `PRI Correction — ${medicine.name}`, [
              `Medicine: ${medicine.name} (${medicine.id})`,
              `Section: ${fieldLabel}`,
              "",
              "Suggested correction:",
              v.suggestedContent?.trim(),
              "",
              v.sourceUrl?.trim() && `Source: ${v.sourceUrl.trim()}`,
              v.submitterName?.trim() && `From: ${v.submitterName.trim()}`,
              v.submitterEmail?.trim() && `Reply to: ${v.submitterEmail.trim()}`,
            ]),
          );
        }}
      >
        {({ isSubmitting, values }) => {
          const ready = !!values.suggestedContent?.trim();
          return (
            <Form noValidate>
              <div className="mb-4">
                <label htmlFor="correction-section" className={labelClass}>Which Section?</label>
                <Field as="select" id="correction-section" name="fieldName" className={`${inputClass} cursor-pointer`}>
                  {FIELD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="mb-4">
                <label htmlFor="correction-suggested" className={labelClass}>Your Suggested Correction *</label>
                <Field
                  as="textarea"
                  id="correction-suggested"
                  name="suggestedContent"
                  placeholder="Describe what should be changed and why..."
                  rows={4}
                  maxLength={5000}
                  className={`${inputClass} resize-y`}
                />
                <ErrorMessage name="suggestedContent" component="p" className={errorClass} />
              </div>

              <div className="mb-4">
                <label htmlFor="correction-source" className={labelClass}>Source / Citation (optional)</label>
                <Field id="correction-source" type="url" name="sourceUrl" placeholder="https://pubmed.ncbi.nlm.nih.gov/..." maxLength={512} className={inputClass} />
                <ErrorMessage name="sourceUrl" component="p" className={errorClass} />
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="correction-name" className={labelClass}>Your Name (optional)</label>
                  <Field id="correction-name" type="text" name="submitterName" placeholder="Name" autoComplete="name" maxLength={256} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="correction-email" className={labelClass}>Email (optional)</label>
                  <Field id="correction-email" type="email" name="submitterEmail" placeholder="email@example.com" autoComplete="email" maxLength={320} className={inputClass} />
                  <ErrorMessage name="submitterEmail" component="p" className={errorClass} />
                </div>
              </div>
              <Field name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              {error && <FormError error={error} mailto={fallback} className="mb-4 text-[.85rem] text-pri-ink" />}

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 border-[1.5px] border-pri-border px-6 py-3 font-mono text-sm font-bold tracking-wide text-pri-tan uppercase">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!ready || isSubmitting}
                  className={`inline-flex flex-[2] items-center justify-center gap-2 px-6 py-3 font-mono text-sm font-bold tracking-wide uppercase ${ready ? "bg-pri-purple text-pri-cream" : "bg-pri-border text-pri-tan"}`}
                >
                  {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
                  Submit Correction
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
