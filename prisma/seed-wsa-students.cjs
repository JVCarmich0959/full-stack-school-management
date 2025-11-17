const { PrismaClient, Day, UserSex } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.replace(/^"|"$/g, ""));
}

function normalizeGradeLevel(rawValue) {
  const value = (rawValue || "").trim();
  if (!value) {
    return null;
  }

  const upperValue = value.toUpperCase();
  if (upperValue === "K" || upperValue === "KINDERGARTEN") {
    return 0;
  }

  if (["EC", "PREK", "PRE-K", "PK", "PREKINDERGARTEN"].includes(upperValue)) {
    return -1;
  }

  const numeric = parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : null;
}

function readStudentCsv() {
  const filePath = path.join(process.cwd(), "prisma", "data", "wsa_students.csv");

  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at ${filePath}`);
  }

  const csv = fs.readFileSync(filePath, "utf8");
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerLine);

  const rows = [];

  for (const rawLine of lines) {
    const cols = parseCsvLine(rawLine);
    const row = {};

    headers.forEach((header, idx) => {
      row[header.trim()] = (cols[idx] || "").trim();
    });

    const gradeLevel = normalizeGradeLevel(row["student_grade_level"]);

    rows.push({
      firstName: row["First Name"],
      lastName: row["Last Name"],
      email: row["Student Email"],
      guardianName: row["Parent/Guardian Name"] || undefined,
      guardianEmail: row["Parent/Guardian Email"] || undefined,
      guardianPhone: row["Parent/Guardian Phone"] || undefined,
      teacher: normalizeTeacherName(row["Teacher"]),
      testingId: row["Student_testing_ID"] || undefined,
      cleverId: row["student_Clever_ID"],
      gradeLevel,
      esparkUsername: row["eSpark_Username"] || undefined,
      esparkPassword: row["eSpark_Password"] || undefined,
    });
  }

  return rows;
}

function makeDate(year, month, day, hour = 8, minute = 0) {
  return new Date(year, month - 1, day, hour, minute);
}

const schoolCalendarEvents = [
  {
    title: "Independence Day Holiday (H)",
    description: "Campus closed in observance of Independence Day.",
    startTime: makeDate(2025, 7, 4, 8),
    endTime: makeDate(2025, 7, 4, 16),
  },
  {
    title: "Kindergarten Screening",
    description: "Two-day screening appointments for incoming kindergarten scholars.",
    startTime: makeDate(2025, 7, 23, 9),
    endTime: makeDate(2025, 7, 24, 15),
  },
  {
    title: "Open House (Grades 2-5)",
    description: "Families of grades 2-5 are invited to meet teachers from 4:30-6:30 PM.",
    startTime: makeDate(2025, 8, 20, 16, 30),
    endTime: makeDate(2025, 8, 20, 18, 30),
  },
  {
    title: "Open House (Grades K-1)",
    description: "Families of kindergarten and grade 1 scholars meet staff from 4:30-6:30 PM.",
    startTime: makeDate(2025, 8, 21, 16, 30),
    endTime: makeDate(2025, 8, 21, 18, 30),
  },
  {
    title: "First Day for Students",
    description: "Welcome back! First instructional day for all scholars.",
    startTime: makeDate(2025, 8, 25, 8),
    endTime: makeDate(2025, 8, 25, 15),
  },
  {
    title: "Teacher Workday (WD)",
    description: "September teacher workday - no school for students.",
    startTime: makeDate(2025, 9, 26, 8),
    endTime: makeDate(2025, 9, 26, 16),
  },
  {
    title: "Fall Holiday (H)",
    description: "School closed for fall holiday.",
    startTime: makeDate(2025, 10, 13, 8),
    endTime: makeDate(2025, 10, 13, 16),
  },
  {
    title: "End of Quarter 1 (Q1)",
    description: "Quarter 1 rotation ends and grades close.",
    startTime: makeDate(2025, 10, 24, 8),
    endTime: makeDate(2025, 10, 24, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "Teacher planning day - students do not report.",
    startTime: makeDate(2025, 10, 31, 8),
    endTime: makeDate(2025, 10, 31, 16),
  },
  {
    title: "Veterans Day Holiday (H)",
    description: "School closed in honor of Veterans Day.",
    startTime: makeDate(2025, 11, 11, 8),
    endTime: makeDate(2025, 11, 11, 16),
  },
  {
    title: "Thanksgiving Break (H)",
    description: "Multi-day holiday break for Thanksgiving.",
    startTime: makeDate(2025, 11, 26, 8),
    endTime: makeDate(2025, 11, 28, 16),
  },
  {
    title: "Winter Holiday Break (H)",
    description: "Campus closed for the winter holiday break.",
    startTime: makeDate(2025, 12, 18, 8),
    endTime: makeDate(2026, 1, 1, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "January teacher workday - no school for scholars.",
    startTime: makeDate(2026, 1, 2, 8),
    endTime: makeDate(2026, 1, 2, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "Mid-year teacher workday - students remain home.",
    startTime: makeDate(2026, 1, 5, 8),
    endTime: makeDate(2026, 1, 5, 16),
  },
  {
    title: "End of Quarter 2 (Q2)",
    description: "Quarter 2 and semester 1 close.",
    startTime: makeDate(2026, 1, 15, 8),
    endTime: makeDate(2026, 1, 15, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "Teacher workday for planning and data days.",
    startTime: makeDate(2026, 1, 30, 8),
    endTime: makeDate(2026, 1, 30, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "Teachers collaborate - no school for students.",
    startTime: makeDate(2026, 2, 16, 8),
    endTime: makeDate(2026, 2, 16, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "Late February teacher workday.",
    startTime: makeDate(2026, 2, 27, 8),
    endTime: makeDate(2026, 2, 27, 16),
  },
  {
    title: "Teacher Workday (WD)",
    description: "Teachers only on campus.",
    startTime: makeDate(2026, 3, 20, 8),
    endTime: makeDate(2026, 3, 20, 16),
  },
  {
    title: "End of Quarter 3 (Q3)",
    description: "Quarter 3 rotation ends.",
    startTime: makeDate(2026, 3, 23, 8),
    endTime: makeDate(2026, 3, 23, 16),
  },
  {
    title: "Early Dismissal (ED)",
    description: "Early dismissal ahead of spring break.",
    startTime: makeDate(2026, 4, 2, 8),
    endTime: makeDate(2026, 4, 2, 12),
  },
  {
    title: "Spring Holiday Break (H)",
    description: "School closed April 3-10 for spring holiday.",
    startTime: makeDate(2026, 4, 3, 8),
    endTime: makeDate(2026, 4, 10, 16),
  },
  {
    title: "Early Dismissal (ED)",
    description: "Early dismissal for scholars on May 15.",
    startTime: makeDate(2026, 5, 15, 8),
    endTime: makeDate(2026, 5, 15, 12),
  },
  {
    title: "Memorial Day Holiday (H)",
    description: "School closed for Memorial Day.",
    startTime: makeDate(2026, 5, 25, 8),
    endTime: makeDate(2026, 5, 25, 16),
  },
  {
    title: "End of Quarter 4 (Q4)",
    description: "Quarter 4 closes for all classes.",
    startTime: makeDate(2026, 5, 29, 8),
    endTime: makeDate(2026, 5, 29, 15),
  },
  {
    title: "Year-End Early Dismissal (ED)",
    description: "Early dismissal window leading into the final week.",
    startTime: makeDate(2026, 6, 1, 8),
    endTime: makeDate(2026, 6, 1, 12),
  },
  {
    title: "Last Day of School (ED)",
    description: "Early dismissal on the final day for scholars.",
    startTime: makeDate(2026, 6, 2, 8),
    endTime: makeDate(2026, 6, 2, 12),
  },
];

const schoolCalendarAnnouncements = [
  {
    title: "Open House Night for Grades 2-5",
    description: "Join us on August 20 from 4:30-6:30 PM to meet teachers and tour classrooms.",
    date: makeDate(2025, 8, 20, 16, 30),
  },
  {
    title: "Open House Night for Kindergarten & Grade 1",
    description: "Families of our youngest scholars are invited on August 21 from 4:30-6:30 PM.",
    date: makeDate(2025, 8, 21, 16, 30),
  },
  {
    title: "First Day for Students",
    description: "August 25 marks the official start of the 2025-26 school year.",
    date: makeDate(2025, 8, 25, 8),
  },
  {
    title: "Winter Holiday Break Begins",
    description: "Winter break starts on December 18 and runs through the New Year.",
    date: makeDate(2025, 12, 18, 8),
  },
  {
    title: "Spring Holiday Break",
    description: "School is closed April 3-10 for the spring holiday.",
    date: makeDate(2026, 4, 3, 8),
  },
  {
    title: "Last Day of School",
    description: "June 2 features an early dismissal to close out the year.",
    date: makeDate(2026, 6, 2, 8),
  },
];

function splitName(fullName) {
  if (!fullName) {
    return { name: "Guardian", surname: "" };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { name: parts[0], surname: "" };
  }

  const name = parts[0];
  const surname = parts.slice(1).join(" ");
  return { name, surname };
}

function toSlug(value) {
  return (
    (value || "unknown")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50) || "unknown"
  );
}

function normalizeTeacherName(value) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed
    .split(/\s+/)
    .map((part) => {
      if (!part) return "";
      return part[0].toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function gradeLabel(gradeLevel) {
  if (gradeLevel === 0) return "K";
  if (gradeLevel === -1) return "EC";
  if (Number.isFinite(gradeLevel)) return `${gradeLevel}`;
  return "General";
}

function teacherGradeKey(teacherName, gradeLevel) {
  const normalizedName = normalizeTeacherName(teacherName) || "Teacher";
  const normalizedGrade = Number.isFinite(gradeLevel) ? gradeLevel : "general";
  return `${normalizedName}|${normalizedGrade}`;
}

const TEACHER_EMAIL_OVERRIDES = {
  "alycia-smith": "alycia.smith@waynestem.org",
  "lisa-beckett": "lisa.beckett@waynestem.org",
  "jennifer-davis": "jennifer.davis@waynestem.org",
  "jazmine-smith": "jazmine.smith@waynestem.org",
  "barbara-pollard": "barbara.pollard@waynestem.org",
  "makenzie-bridgers": "makenzie.bridgers@waynestem.org",
  "taylor-dohar": "taylor.dohar@waynestem.org",
  "hollie-danis": "hollie.danis@waynestem.org",
  "tenisha-mcclain": "tenisha.mcclain@waynestem.org",
  "sherri-fortner": "sherri.fortner@waynestem.org",
  "fortner": "sherri.fortner@waynestem.org",
  "madison-gibson": "madison.gibson@waynestem.org",
  "gibson": "madison.gibson@waynestem.org",
  "stephanie-ham": "stephanie.ham@waynestem.org",
  "ham": "stephanie.ham@waynestem.org",
  "krystal-helms": "krystal.helms@waynestem.org",
  "helms": "krystal.helms@waynestem.org",
  "katherine-mello": "katherine.mello@waynestem.org",
  "mello": "katherine.mello@waynestem.org",
  "courtney-wingenroth": "courtney.wingenroth@waynestem.org",
  "wingenroth": "courtney.wingenroth@waynestem.org",
  "shannan-woresly": "shannan.woresly@waynestem.org",
  "woresly": "shannan.woresly@waynestem.org",
};

function getTeacherEmail(teacherName) {
  if (!teacherName) {
    return null;
  }
  const slug = toSlug(teacherName);
  return TEACHER_EMAIL_OVERRIDES[slug] || `${slug}@waynestem.org`;
}

async function seedAdmins() {
  const admins = [
    { id: "admin1", username: "admin1" },
    { id: "admin2", username: "admin2" },
  ];

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { id: admin.id },
      update: admin,
      create: admin,
    });
  }
}

async function seedSubjects() {
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: subject,
      create: subject,
    });
  }
}

async function seedTeachers(rows) {
  const teacherMap = new Map();
  const teacherEntries = new Map();

  for (const row of rows) {
    const gradeLevel = Number.isFinite(row.gradeLevel) ? row.gradeLevel : null;
    const key = teacherGradeKey(row.teacher, gradeLevel);
    if (!teacherEntries.has(key)) {
      teacherEntries.set(key, {
        name: row.teacher || `Teacher ${gradeLabel(gradeLevel)}`,
        gradeLevel,
      });
    }
  }

  if (teacherEntries.size === 0) {
    for (let i = 1; i <= 5; i++) {
      const gradeLevel = i;
      const key = teacherGradeKey(`Teacher ${i}`, gradeLevel);
      teacherEntries.set(key, { name: `Teacher ${i}`, gradeLevel });
    }
  }

  for (const [key, entry] of teacherEntries) {
    const baseName = entry.name || "Teacher";
    const slugBase = toSlug(baseName);
    const gradeSuffix =
      entry.gradeLevel === null
        ? "general"
        : gradeLabel(entry.gradeLevel).toLowerCase();
    const id = `teacher-${slugBase}-${gradeSuffix}`;
    const { name, surname } = splitName(baseName);
    const shortName =
      entry.gradeLevel === null
        ? baseName
        : `${baseName} (${gradeLabel(entry.gradeLevel)})`;
    const baseEmail = getTeacherEmail(baseName);
    let email;
    if (baseEmail) {
      if (entry.gradeLevel === null) {
        email = baseEmail;
      } else {
        const [local, domain] = baseEmail.split("@");
        email = `${local}+${gradeSuffix}@${domain}`;
      }
    } else {
      email = `${slugBase}-${gradeSuffix}@waynestem.org`;
    }

    const teacher = await prisma.teacher.upsert({
      where: { id },
      update: { shortName },
      create: {
        id,
        username: id,
        name,
        surname: surname || "",
        email,
        phone: null,
        address: "Unknown",
        bloodType: "Unknown",
        sex: UserSex.MALE,
        shortName,
        birthday: new Date("1990-01-01"),
      },
    });

    teacherMap.set(key, teacher.id);
  }

  return teacherMap;
}

async function seedGrades(rows) {
  const gradeLevels = new Set();

  for (const row of rows) {
    if (Number.isFinite(row.gradeLevel)) {
      gradeLevels.add(row.gradeLevel);
    }
  }

  if (gradeLevels.size === 0) {
    for (let i = 1; i <= 6; i++) {
      gradeLevels.add(i);
    }
  }

  const gradeMap = new Map();

  for (const level of gradeLevels) {
    const grade = await prisma.grade.upsert({
      where: { level },
      update: {},
      create: { level },
    });
    gradeMap.set(level, grade.id);
  }

  return gradeMap;
}

async function seedClasses(rows, gradeMap, teacherMap) {
  const classMap = new Map();

  for (const row of rows) {
    const gradeLevel = row.gradeLevel;
    const gradeId = gradeMap.get(gradeLevel);
    if (!gradeId) continue;

    const homeroom = row.teacher || "A";
    const classKey = `${gradeLevel}-${homeroom}`;
    if (classMap.has(classKey)) {
      continue;
    }

    const className = `${gradeLabel(gradeLevel)}-${toSlug(homeroom)}`;
    const supervisorId = teacherMap.get(
      teacherGradeKey(row.teacher, gradeLevel)
    );

    const classRecord = await prisma.class.upsert({
      where: { name: className },
      update: {},
      create: {
        name: className,
        gradeId,
        capacity: 30,
        supervisorId: supervisorId || null,
      },
    });

    classMap.set(classKey, classRecord.id);
  }

  if (classMap.size === 0) {
    // ensure at least one class exists
    const firstGradeId = gradeMap.values().next().value;
    const classRecord = await prisma.class.upsert({
      where: { name: "1-default" },
      update: {},
      create: { name: "1-default", gradeId: firstGradeId, capacity: 30 },
    });
    classMap.set("1-default", classRecord.id);
  }

  return classMap;
}

async function seedParents(rows) {
  const parentMap = new Map();

  for (const row of rows) {
    // Use email → phone → name → cleverId as the uniqueness key
    const key =
      row.guardianEmail ||
      row.guardianPhone ||
      row.guardianName ||
      row.cleverId;

    const slug = toSlug(key);
    const id = `parent-${slug}`;

    if (parentMap.has(key)) {
      continue;
    }

    const { name, surname } = splitName(row.guardianName);

    const parent = await prisma.parent.upsert({
      where: { id },
      update: {
        name,
        surname,
        email: row.guardianEmail || null,
        phone: row.guardianPhone || null,
        address: "Unknown",
        username: `guardian-${slug}`,
      },
      create: {
        id,
        username: `guardian-${slug}`,
        name,
        surname,
        email: row.guardianEmail || null,
        phone: row.guardianPhone || null,
        address: "Unknown",
      },
    });

    parentMap.set(key, parent.id);
  }

  return parentMap;
}

async function seedStudentsFromCsv(rows, gradeMap, classMap, parentMap) {
  const studentIds = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    const gradeId = gradeMap.get(row.gradeLevel);
    if (!gradeId) continue;

    const classKey = `${row.gradeLevel}-${row.teacher || "A"}`;
    const fallbackClassKey = classMap.keys().next().value;
    const classId = classMap.get(classKey) ?? classMap.get(fallbackClassKey);
    if (!classId) continue;

    const parentKey =
      row.guardianEmail ||
      row.guardianPhone ||
      row.guardianName ||
      row.cleverId;
    const parentId = parentKey ? parentMap.get(parentKey) : undefined;
    const parentRelationData = parentId
      ? {
          parent: {
            connect: { id: parentId },
          },
        }
      : {};
    const classRelationData = {
      class: {
        connect: { id: classId },
      },
    };
    const gradeRelationData = {
      grade: {
        connect: { id: gradeId },
      },
    };

    const studentUsername =
      (row.email && row.email.split("@")[0]) || `student-${row.cleverId}`;
    const fullNameLower = `${row.firstName} ${row.lastName}`.toLowerCase();
    const hasEsparkCreds = Boolean(row.esparkUsername || row.esparkPassword);

    const student = await prisma.student.upsert({
      where: { cleverId: row.cleverId },
      update: {
        firstName: row.firstName,
        lastName: row.lastName,
        name: row.firstName,
        surname: row.lastName,
        email: row.email,
        username: studentUsername,
        gradeLevel: row.gradeLevel,
        fullNameLower,
        testingId: row.testingId || null,
        esparkUsername: row.esparkUsername || null,
        esparkPassword: row.esparkPassword || null,
        hasEsparkCreds,
        guardianName: row.guardianName || null,
        guardianEmail: row.guardianEmail || null,
        guardianPhone: row.guardianPhone || null,
        homeroom: row.teacher || null,
        ...parentRelationData,
        ...classRelationData,
        ...gradeRelationData,
      },
      create: {
        id: row.cleverId,
        firstName: row.firstName,
        lastName: row.lastName,
        name: row.firstName,
        surname: row.lastName,
        email: row.email,
        username: studentUsername,
        phone: null,
        address: "Unknown",
        bloodType: "Unknown",
        sex: index % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date("2010-01-01"),
        gradeLevel: row.gradeLevel,
        fullNameLower,
        cleverId: row.cleverId,
        testingId: row.testingId || null,
        esparkUsername: row.esparkUsername || null,
        esparkPassword: row.esparkPassword || null,
        hasEsparkCreds,
        guardianName: row.guardianName || null,
        guardianEmail: row.guardianEmail || null,
        guardianPhone: row.guardianPhone || null,
        homeroom: row.teacher || null,
        ...parentRelationData,
        ...classRelationData,
        ...gradeRelationData,
      },
    });

    studentIds.push(student.id);
  }

  return studentIds;
}

async function seedLessons(teacherMap, classMap) {
  const teacherIds = Array.from(new Set(Array.from(teacherMap.values())));
  const classIds = Array.from(new Set(classMap.values()));
  const subjectIds = (
    await prisma.subject.findMany({ select: { id: true } })
  ).map((s) => s.id);

  if (teacherIds.length === 0 || classIds.length === 0 || subjectIds.length === 0) {
    return;
  }

  const days = Object.keys(Day);

  for (let i = 0; i < 10; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson ${i + 1}`,
        day: Day[days[i % days.length]],
        startTime: new Date(new Date().setHours(9 + (i % 3))),
        endTime: new Date(new Date().setHours(10 + (i % 3))),
        subjectId: subjectIds[i % subjectIds.length],
        classId: classIds[i % classIds.length],
        teacherId: teacherIds[i % teacherIds.length],
      },
    });
  }
}

async function seedAssessmentsAndAttendance(studentIds) {
  const lessons = await prisma.lesson.findMany({ select: { id: true } });
  if (lessons.length === 0 || studentIds.length === 0) {
    return;
  }

  for (let i = 0; i < Math.min(5, lessons.length); i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i + 1}`,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: lessons[i].id,
      },
    });

    await prisma.assignment.create({
      data: {
        title: `Assignment ${i + 1}`,
        startDate: new Date(),
        dueDate: new Date(),
        lessonId: lessons[i].id,
      },
    });
  }

  const exams = await prisma.exam.findMany({ select: { id: true } });
  const assignments = await prisma.assignment.findMany({ select: { id: true } });

  for (let i = 0; i < Math.min(studentIds.length, 10); i++) {
    const studentId = studentIds[i];

    if (exams[i]) {
      await prisma.result.create({
        data: {
          score: 90,
          studentId,
          examId: exams[i].id,
        },
      });
    }

    if (assignments[i]) {
      await prisma.result.create({
        data: {
          score: 85,
          studentId,
          assignmentId: assignments[i].id,
        },
      });
    }

    if (lessons[i]) {
      await prisma.attendance.create({
        data: {
          date: new Date(),
          present: true,
          studentId,
          lessonId: lessons[i].id,
        },
      });
    }
  }
}

async function seedEvents() {
  for (const event of schoolCalendarEvents) {
    await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
      },
    });
  }

  for (const announcement of schoolCalendarAnnouncements) {
    await prisma.announcement.create({
      data: {
        title: announcement.title,
        description: announcement.description,
        date: announcement.date,
      },
    });
  }
}

async function resetData() {
  await prisma.$transaction([
    prisma.attendance.deleteMany(),
    prisma.result.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.class.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.event.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.admin.deleteMany(),
  ]);
}

async function main() {
  const rows = readStudentCsv();

  await resetData();
  await seedAdmins();
  await seedSubjects();
  const teacherMap = await seedTeachers(rows);
  const gradeMap = await seedGrades(rows);
  const classMap = await seedClasses(rows, gradeMap, teacherMap);
  const parentMap = await seedParents(rows);
  const studentIds = await seedStudentsFromCsv(
    rows,
    gradeMap,
    classMap,
    parentMap
  );

  await seedLessons(teacherMap, classMap);
  await seedAssessmentsAndAttendance(studentIds);
  await seedEvents();

  console.log("Seeding completed successfully from CSV.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
