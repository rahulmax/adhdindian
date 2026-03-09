import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "rahulmax";
const REPO_NAME = "adhdindian";

type SubmissionType = "correction" | "review" | "new-doctor";

function formatCorrectionBody(fields: Record<string, unknown>): string {
  const incorrect = (fields.incorrect as string[]) || [];
  const lines = [
    `**Doctor:** ${fields.doctorName}`,
    fields.doctorId ? `**Doctor ID:** ${fields.doctorId}` : "",
    "",
    `**What's incorrect:**`,
    ...incorrect.map((item: string) => `- [x] ${item}`),
    "",
    `**Correct information:**`,
    String(fields.correctInfo || ""),
  ];
  if (fields.source) {
    lines.push("", `**How do you know:**`, String(fields.source));
  }
  return lines.filter((l) => l !== "").join("\n");
}

function formatReviewBody(fields: Record<string, unknown>): string {
  return [
    `**Doctor:** ${fields.doctorName}`,
    fields.doctorId ? `**Doctor ID:** ${fields.doctorId}` : "",
    "",
    `**Overall experience:** ${fields.experience}`,
    "",
    `**Review:**`,
    String(fields.review || ""),
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function formatNewDoctorBody(fields: Record<string, unknown>): string {
  const lines = [
    `**Doctor Name:** ${fields.doctorName}`,
    `**Type:** ${fields.type}`,
    `**City:** ${fields.city}`,
  ];
  if (fields.address) lines.push(`**Address:** ${fields.address}`);
  if (fields.fee) lines.push(`**Fee:** ₹${fields.fee}`);
  if (fields.consultationMode) lines.push(`**Consultation Mode:** ${fields.consultationMode}`);
  if (fields.contact) lines.push(`**Contact:** ${fields.contact}`);
  if (fields.stimulants) lines.push(`**Prescribes Stimulants:** ${fields.stimulants}`);
  if (fields.adultADHD) lines.push(`**Adult ADHD Specialist:** ${fields.adultADHD}`);
  if (fields.otherDetails) {
    lines.push("", `**Other details:**`, String(fields.otherDetails));
  }
  return lines.join("\n");
}

function getTitle(type: SubmissionType, fields: Record<string, unknown>): string {
  switch (type) {
    case "correction":
      return `Correction: ${fields.doctorName}${fields.city ? ` (${fields.city})` : ""}`;
    case "review":
      return `Review: ${fields.doctorName}${fields.city ? ` (${fields.city})` : ""}`;
    case "new-doctor":
      return `New Doctor: ${fields.doctorName}${fields.city ? ` (${fields.city})` : ""}`;
  }
}

function getLabel(type: SubmissionType): string {
  return type;
}

function formatBody(type: SubmissionType, fields: Record<string, unknown>): string {
  switch (type) {
    case "correction":
      return formatCorrectionBody(fields);
    case "review":
      return formatReviewBody(fields);
    case "new-doctor":
      return formatNewDoctorBody(fields);
  }
}

export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let body: { type: SubmissionType; fields: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, fields } = body;

  if (!type || !fields || !["correction", "review", "new-doctor"].includes(type)) {
    return NextResponse.json({ error: "Invalid submission type" }, { status: 400 });
  }

  // Basic validation
  if ((type === "correction" || type === "review") && !fields.doctorName) {
    return NextResponse.json({ error: "Doctor name is required" }, { status: 400 });
  }
  if (type === "correction" && !fields.correctInfo) {
    return NextResponse.json({ error: "Correct information is required" }, { status: 400 });
  }
  if (type === "review" && (!fields.experience || !fields.review)) {
    return NextResponse.json({ error: "Experience and review are required" }, { status: 400 });
  }
  if (type === "new-doctor" && (!fields.doctorName || !fields.type || !fields.city)) {
    return NextResponse.json({ error: "Name, type, and city are required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: getTitle(type, fields),
        body: formatBody(type, fields),
        labels: [getLabel(type)],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GitHub API error:", res.status, err);
      return NextResponse.json({ error: "Failed to create submission" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("GitHub API request failed:", err);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 502 });
  }
}
