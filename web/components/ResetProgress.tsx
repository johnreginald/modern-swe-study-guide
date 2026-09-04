"use client";

import { useState } from "react";
import { resetAll } from "@/lib/progress";

export default function ResetProgress({ weeks }: { weeks: number[] }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => setArmed(true)}>
        Reset progress
      </button>
    );
  }
  return (
    <div className="reset-row">
      <span>Clear every ticked criterion on this device?</span>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          resetAll(weeks);
          setArmed(false);
        }}
      >
        Yes, reset
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setArmed(false)}>
        Cancel
      </button>
    </div>
  );
}
