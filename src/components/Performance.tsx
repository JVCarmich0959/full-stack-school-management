"use client";
import Image from "next/image";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

type PerformanceProps = {
  present: number;
  absent: number;
};

const Performance = ({ present, absent }: PerformanceProps) => {
  const total = present + absent;
  const hasData = total > 0;
  const attendanceRate = hasData ? Math.round((present / total) * 100) : null;

  const chartData = hasData
    ? [
        { name: "Present", value: present, fill: "#C3EBFA" },
        { name: "Absent", value: absent, fill: "#FAE27C" },
      ]
    : [{ name: "No attendance", value: 1, fill: "#E5E7EB" }];

  return (
    <div className="bg-white p-4 rounded-md h-80 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Attendance balance</h1>
        <Image src="/moreDark.png" alt="" width={16} height={16} />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            fill="#8884d8"
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-3xl font-bold">
          {attendanceRate !== null ? `${attendanceRate}%` : "--"}
        </h1>
        <p className="text-xs text-gray-300">
          {hasData
            ? "Presence across recorded lessons"
            : "No attendance records yet"}
        </p>
      </div>
      <h2 className="font-medium absolute bottom-16 left-0 right-0 m-auto text-center">
        Present vs Absent
      </h2>
    </div>
  );
};

export default Performance;
