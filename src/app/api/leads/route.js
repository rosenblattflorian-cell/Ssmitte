import { NextResponse } from "next/server";

function calculateScore(lead) {
  let score = 0;
  if (lead.owner) score += 25;
  if (lead.roofArea >= 40) score += 20;
  if (lead.powerUsage >= 4000) score += 20;
  return Math.min(score, 100);
}

function scoreLabel(score) {
  if (score >= 61) return "GREEN";
  if (score >= 31) return "YELLOW";
  return "RED";
}

export async function POST(req) {
  const lead = await req.json();
  const score = calculateScore(lead);

  return NextResponse.json({
    ...lead,
    score,
    label: scoreLabel(score),
    status: "NEW",
    createdAt: new Date(),
  });
}
