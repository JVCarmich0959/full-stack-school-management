"use client";

import type { ChangeEventHandler } from "react";
import { useMemo, useState } from "react";

type Format = "csv" | "json";

type ImportResult = {
  name: string;
  rowCount: number;
  status: "success" | "error";
  message: string;
};

const sampleRows = [
  { id: 1, name: "A. Carter", cohort: "Grade 9", attendance: "98%" },
  { id: 2, name: "B. Ahmed", cohort: "Grade 8", attendance: "94%" },
  { id: 3, name: "C. Lee", cohort: "Grade 10", attendance: "97%" },
];

const toCsv = (rows: typeof sampleRows) => {
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map((row) => Object.values(row).join(",")).join("\n");
  return `${header}\n${body}`;
};

const DataExchangePanel = () => {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const exportPayload = useMemo(
    () => ({
      generatedAt: new Date().toISOString(),
      source: "Admin dashboard",
      rows: sampleRows,
    }),
    []
  );

  const download = (format: Format) => {
    const filename = `dashboard-export.${format}`;
    const content =
      format === "json"
        ? JSON.stringify(exportPayload, null, 2)
        : toCsv(exportPayload.rows);

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = file.name.endsWith(".csv")
          ? text
              .split("\n")
              .filter(Boolean)
              .slice(1)
              .map((row) => row.split(","))
          : JSON.parse(text).rows ?? [];

        setImportResult({
          name: file.name,
          rowCount: parsed.length,
          status: "success",
          message: `Imported ${parsed.length} rows from ${file.name}`,
        });
      } catch (error) {
        setImportResult({
          name: file.name,
          rowCount: 0,
          status: "error",
          message: "We couldn't read that file. Please try JSON or CSV.",
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-gray-500">Export / Import data</p>
          <h2 className="font-semibold text-lg leading-tight">Data portability</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded-full">JSON</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">CSV</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">Export dashboard snapshot</p>
            <span className="text-xs text-gray-500">3 sample rows</span>
          </div>
          <p className="text-sm text-gray-600">
            Download a structured extract of attendance and roster data for
            archival or further analysis.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => download("json")}
              className="text-xs px-3 py-2 rounded-full bg-primary text-white hover:opacity-90 transition"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => download("csv")}
              className="text-xs px-3 py-2 rounded-full border border-gray-200 hover:bg-white"
            >
              Export CSV
            </button>
          </div>
        </div>

        <label className="p-3 rounded-xl bg-plSkyLight/60 border border-plSkyLight text-sm text-gray-800 flex flex-col gap-2 cursor-pointer">
          <div className="flex items-center justify-between">
            <p className="font-medium">Import roster updates</p>
            <span className="text-xs text-gray-600">JSON or CSV</span>
          </div>
          <p className="text-sm text-gray-700">
            Drag and drop a CSV/JSON export to refresh student, parent, or
            attendance data. We highlight the number of detected rows.
          </p>
          <input
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={handleImport}
          />
          <span className="text-xs text-primary font-medium">Select a file</span>
        </label>
      </div>

      {importResult && (
        <div
          className={`rounded-xl border p-3 text-sm flex items-center justify-between ${
            importResult.status === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div>
            <p className="font-semibold">{importResult.message}</p>
            <p className="text-xs">File: {importResult.name}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white border border-current">
            {importResult.status === "success" ? `${importResult.rowCount} rows` : "Action required"}
          </span>
        </div>
      )}
    </section>
  );
};

export default DataExchangePanel;
