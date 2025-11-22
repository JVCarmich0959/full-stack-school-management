import type {
  CleanStudentProfile,
  RawStudentProfile,
  SubjectBenchmark,
} from "@/types/studentProfile";

const gradeLookup: Record<string, string> = {
  "1th": "1st",
  "2th": "2nd",
  "3th": "3rd",
};

const normalizeGrade = (grade?: string | number): string => {
  if (typeof grade === "number") {
    if (grade === 1) return "1st";
    if (grade === 2) return "2nd";
    if (grade === 3) return "3rd";
    return `${grade}th`;
  }

  const normalized = (grade || "").trim();
  if (!normalized) return "Unknown";
  if (gradeLookup[normalized]) return gradeLookup[normalized];
  if (/\d+th/g.test(normalized) || /\d+st/g.test(normalized)) {
    return normalized;
  }

  return normalized;
};

const validateContact = (value?: string | null, type: "email" | "phone") => {
  if (!value) return null;
  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? value : null;
  }
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10 ? value : null;
};

const clampScore = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value < 0) {
    console.warn("[sanitize] negative score detected");
    return null;
  }
  if (value > 100) {
    console.warn("[sanitize] score above 100 detected");
    return null;
  }
  return Math.round(value);
};

const resolveSubjectScores = (
  benchmarks?: RawStudentProfile["subjectBenchmarks"]
): SubjectBenchmark[] => {
  if (!benchmarks) return [];
  const seen = new Map<string, SubjectBenchmark>();

  for (const entry of benchmarks) {
    if (!entry?.subject) continue;
    const studentScore = clampScore(entry.student);
    const classAvg = clampScore(entry.classAvg);

    if (studentScore === null) continue;

    const existing = seen.get(entry.subject);
    if (!existing) {
      seen.set(entry.subject, {
        subject: entry.subject,
        student: studentScore,
        classAvg: classAvg ?? studentScore,
      });
    } else if (classAvg !== null) {
      existing.classAvg = classAvg;
    }
  }

  return Array.from(seen.values());
};

export const sanitizeStudentProfile = (
  raw: RawStudentProfile
): CleanStudentProfile => {
  if (!raw.id) {
    throw new Error("Missing student id");
  }
  if (!raw.name) {
    throw new Error("Missing student name");
  }

  const warnings: CleanStudentProfile["warnings"] = [];

  const attendanceCandidates = [
    raw.metrics?.attendance,
    raw.attendance,
  ].filter((value) => typeof value === "number");
  const attendance =
    attendanceCandidates.length > 0
      ? Math.max(
          0,
          Math.min(100, Math.round(attendanceCandidates[0] as number))
        )
      : 0;

  const subjects = resolveSubjectScores(raw.subjectBenchmarks);

  const email = validateContact(raw.contact?.email, "email");
  if (!email && raw.contact?.email) {
    warnings.push({ field: "contact.email", issue: "Invalid email" });
  }

  const phone = validateContact(raw.contact?.phone, "phone");
  if (!phone && raw.contact?.phone) {
    warnings.push({ field: "contact.phone", issue: "Invalid phone" });
  }

  if (subjects.length === 0) {
    warnings.push({ field: "subjectBenchmarks", issue: "No valid scores" });
  }

  if (attendance === 0) {
    warnings.push({
      field: "attendance",
      issue: "Attendance missing, defaulted to 0",
    });
  }

  return {
    id: raw.id,
    name: raw.name,
    grade: normalizeGrade(raw.grade),
    attendance,
    subjects,
    contact: {
      email,
      phone,
    },
    warnings,
  };
};

// TODO: Integrate with Zod schema for runtime validation
// TODO: Add Jest tests for common contradictions
