"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);

  async function submitLead() {
    const res = await fetch("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Max Mustermann",
        owner: true,
        roofArea: 55,
        powerUsage: 4800,
      }),
    });
    setResult(await res.json());
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Solar Lead App – MVP</h1>
      <button onClick={submitLead}>Lead bewerten</button>
      {result && <pre style={{ marginTop: 20 }}>{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}
