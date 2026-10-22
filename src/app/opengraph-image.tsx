import { ImageResponse } from "next/og";

// The share image every page uses (no page sets its own).
export const alt = "Psychedelic Readiness Index: an honest map of where you stand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-between bg-[#1c1410] p-20 text-[#f4f0e8]">
        <div tw="flex items-center">
          <svg width="96" height="96" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#2a1f19" />
            <path d="M8.6 21.6a9 9 0 1 1 14.8 0" fill="none" stroke="#b87bf9" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M16 17.2 21.2 11" stroke="#d4b96a" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="16" cy="17.2" r="2.6" fill="#d4b96a" />
          </svg>
          <div tw="ml-6 text-3xl tracking-widest text-[#d4b96a]">PSYCHEDELICREADINESS.COM</div>
        </div>
        <div tw="flex flex-col">
          <div tw="text-8xl font-bold">Psychedelic Readiness Index</div>
          <div tw="mt-6 text-4xl text-[#f4f0e8]/70">39 medicines. 6 domains. Know where you stand before you go in.</div>
        </div>
      </div>
    ),
    size,
  );
}
