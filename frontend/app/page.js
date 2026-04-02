"use client";

import { useState } from "react";
import Dashboard from "../components/Dashboard";
import FilePicker from "../components/FilePicker";

const emptyResponse = {
  original_text: "",
  summary: [],
  mcqs: [],
  answer_key: [],
};

const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024;

function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return configured.endsWith("/process") ? configured.slice(0, -"/process".length) : configured;
}

export default function Home() {
  const [files, setFiles] = useState([]);
  const [studyData, setStudyData] = useState(emptyResponse);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqCount, setMcqCount] = useState(5);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFiles) => {
    const totalSize = selectedFiles.reduce((sum, current) => sum + current.size, 0);
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      setError("Total file size must be 100 MB or less.");
      return;
    }

    setFiles(selectedFiles);
    setError("");
  };

  const handleSubmit = async () => {
    if (!files.length) {
      setError("Please select at least one image to process.");
      return;
    }

    setProcessingLoading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const baseUrl = getApiBaseUrl();

      const response = await fetch(`${baseUrl}/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
      }

      const data = await response.json();
      setStudyData({
        original_text: data.original_text || "",
        summary: Array.isArray(data.summary)
          ? data.summary
          : data.summary
          ? [data.summary]
          : [],
        mcqs: [],
        answer_key: [],
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStudyData(emptyResponse);
    } finally {
      setProcessingLoading(false);
    }
  };

  const handleGenerateMcq = async () => {
    if (!studyData.original_text && studyData.summary.length === 0) {
      setError("Process images first to generate MCQs.");
      return;
    }

    setMcqLoading(true);
    setError("");

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/generate-mcq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_text: studyData.original_text,
          summary: studyData.summary,
          count: mcqCount,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "MCQ generation failed");
      }

      const data = await response.json();
      setStudyData((previous) => ({
        ...previous,
        mcqs: Array.isArray(data.mcqs) ? data.mcqs : [],
        answer_key: Array.isArray(data.answer_key) ? data.answer_key : [],
      }));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setMcqLoading(false);
    }
  };

  const totalBytes = files.reduce((sum, current) => sum + current.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const filesSummary = files.length
    ? `${files.length} file(s) selected • ${totalMb} MB total`
    : "";

  return (
    <main className="min-h-screen px-5 py-12">
      <div className="mx-auto w-full max-w-[800px] space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase">Smart Study Scanner</p>
          <h1 className="text-3xl font-bold tracking-[-0.02em] bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            Zen Study AI
          </h1>
          <p className="text-zinc-400 max-w-2xl leading-7">
          Upload one or more study snapshots and get clean text plus concise bullets. Then choose how many
          MCQs you want and generate them on demand.
          </p>
        </header>

        <section className="space-y-4">
          <FilePicker
            onFileSelect={handleFileSelect}
            filesSummary={filesSummary}
            hasFiles={files.length > 0}
            onUpload={handleSubmit}
            loading={processingLoading}
          />
          {error ? (
            <p className="text-sm text-red-300 border border-red-900/40 rounded-lg px-3 py-2 bg-red-950/30">
              {error}
            </p>
          ) : null}
        </section>

        <Dashboard
          data={studyData}
          loading={processingLoading}
          mcqCount={mcqCount}
          onMcqCountChange={setMcqCount}
          onGenerateMcq={handleGenerateMcq}
          mcqLoading={mcqLoading}
        />
      </div>
    </main>
  );
}
