"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Today's date for the printed question set. Read in the browser (the page itself is static,
// so a server-rendered date would be the build date); empty during server render.
export function PrintedOn() {
  const date = useSyncExternalStore(
    subscribe,
    () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    () => "",
  );
  return <>{date}</>;
}
