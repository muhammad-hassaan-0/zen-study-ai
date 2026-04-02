"use client";

import { Loader2, Upload } from "lucide-react";

export default function FilePicker({ onFileSelect, filesSummary, hasFiles, onUpload, loading }) {
  const handleChange = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 0) {
      onFileSelect(selected);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-5 bg-gradient-to-b from-zinc-900 to-black">
      <label
        className={[
          "group flex items-center gap-4 cursor-pointer rounded-xl bg-black/40 px-4 py-5",
          hasFiles
            ? "border border-zinc-400 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
            : "border border-dashed border-zinc-800 hover:border-zinc-600 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]",
        ].join(" ")}
        htmlFor="file-input"
      >
        <div className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center bg-zinc-950">
          <Upload className="w-5 h-5 text-zinc-300 group-hover:text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-medium text-white">Drop or click to upload images</span>
          <span className="text-sm text-zinc-400">
            {filesSummary || "PNG, JPG, or HEIC images. Multiple files allowed (max total 100 MB)."}
          </span>
        </div>
      </label>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onUpload}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-950 text-zinc-100 px-4 py-2 text-sm font-medium hover:border-zinc-500 hover:bg-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Processing" : "Send to AI"}
        </button>
      </div>
    </div>
  );
}
