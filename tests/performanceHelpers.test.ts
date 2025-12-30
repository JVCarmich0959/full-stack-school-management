import assert from "node:assert";
import {
  aggregateSubjectMetrics,
  calculateAttendanceRate,
  computeGrowthRate,
  determineAssessments,
  type ResultRecord,
  estimateMathFluency,
  estimateReadingMinutes,
} from "../src/lib/performance/helpers";

const mathSubject = {
  lesson: {
    subject: {
      id: 1,
      name: "Mathematics",
    },
  },
};

const elaSubject = {
  lesson: {
    subject: {
      id: 2,
      name: "English Language Arts",
    },
  },
};

const studentResults: ResultRecord[] = [
  {
    score: 88,
    exam: {
      title: "Math Benchmark",
      startTime: new Date("2024-02-01"),
      lesson: mathSubject.lesson,
    },
  },
  {
    score: 92,
    assignment: {
      title: "ELA Writing",
      dueDate: new Date("2024-02-15"),
      lesson: elaSubject.lesson,
    },
  },
];

const classResults: ResultRecord[] = [
  {
    score: 80,
    exam: {
      title: "Math Benchmark",
      startTime: new Date("2024-02-01"),
      lesson: mathSubject.lesson,
    },
  },
  {
    score: 85,
    assignment: {
      title: "ELA Writing",
      dueDate: new Date("2024-02-15"),
      lesson: elaSubject.lesson,
    },
  },
];

const attendanceRecords = [
  { present: true },
  { present: false },
  { present: true },
];

const run = () => {
  const subjects = aggregateSubjectMetrics(studentResults, classResults);
  assert(subjects.length >= 2, "Should return at least two subjects");
  assert(subjects.some((subject) => subject.name === "Mathematics"));
  assert(subjects.some((subject) => subject.name === "ELA"));

  const assessments = determineAssessments(studentResults);
  assert(assessments.length === 2, "Should return all assessments in order");

  const growth = computeGrowthRate(studentResults);
  assert(growth >= 0, "Growth should be non-negative");

  const attendance = calculateAttendanceRate(attendanceRecords);
  assert(attendance === 67, "Attendance rate should round to 67");

  const readingMinutes = estimateReadingMinutes(subjects);
  assert(readingMinutes >= 150 && readingMinutes <= 420);

  const mathFluency = estimateMathFluency(subjects);
  assert(mathFluency >= 0 && mathFluency <= 100);

  console.log("✅ performance helpers smoke test passed");
};

run();
