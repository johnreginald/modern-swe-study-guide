"use client";

import { useState } from "react";
import { resetAll } from "@/lib/progress";

type Labels = { reset: string; confirm: string; yes: string; cancel: string };

export default function ResetProgress({ weeks, labels }: { weeks: number[]; labels: Labels }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => setArmed(true)}>
        {labels.reset}
      </button>
    );
  }
  return (
    <div className="reset-row">
      <span>{labels.confirm}</span>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          resetAll(weeks);
          setArmed(false);
        }}
      >
        {labels.yes}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setArmed(false)}>
        {labels.cancel}
      </button>
    </div>
  );
}
