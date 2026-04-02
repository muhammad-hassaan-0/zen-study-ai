"use client";

import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Dashboard({
  data,
  loading,
  mcqCount,
  onMcqCountChange,
  onGenerateMcq,
  mcqLoading,
}) {
  const { original_text, summary, mcqs, answer_key } = data;
  const [expandedText, setExpandedText] = useState(false);

  const isLongText = useMemo(() => original_text.length > 420, [original_text]);

  const Section = ({ title, children }) => (
    <section className="glass-panel relative overflow-hidden rounded-xl p-5 space-y-4 bg-gradient-to-b from-zinc-900 to-black">
      {loading ? (
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-white/10 overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-white/50"
            animate={{ x: ["-120%", "300%"] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {loading ? <span className="text-xs text-zinc-400">Updating...</span> : null}
      </div>
      <div className="text-zinc-300 space-y-3">{children}</div>
    </section>
  );

  return (
    <div className="space-y-4">
      <Section title="Extracted Text">
        {original_text ? (
          <div className="space-y-3">
            <div
              className={[
                "relative rounded-lg border border-white/10 bg-zinc-950/70 p-4 text-sm leading-7 raw-text-mono",
                expandedText ? "" : "max-h-[11rem] overflow-hidden",
                !expandedText && isLongText ? "fade-bottom" : "",
              ].join(" ")}
            >
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:bg-zinc-950 prose-code:text-zinc-200">
                <ReactMarkdown>{original_text}</ReactMarkdown>
              </div>
            </div>
            {isLongText ? (
              <button
                type="button"
                onClick={() => setExpandedText((previous) => !previous)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                {expandedText ? "Show Less" : "Show More"}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-zinc-400">Upload study images to see extracted text.</p>
        )}
      </Section>

      <Section title="Summary Bullets">
        {summary && summary.length > 0 ? (
          <ul className="space-y-3">
            {summary.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-7">
                <Check className="mt-1 h-4 w-4 text-zinc-400" />
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-0 prose-li:my-0 text-zinc-200">
                  <ReactMarkdown>{item}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-400">We will summarize the key points for you.</p>
        )}
      </Section>

      <Section title="MCQ Generator">
        {mcqs && mcqs.length > 0 ? (
          <div className="space-y-4">
            {mcqs.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3 space-y-2">
                <p className="font-medium text-zinc-100">Q{idx + 1}. {item.question}</p>
                {Array.isArray(item.options) ? (
                  <ul className="text-sm text-zinc-300 space-y-1.5">
                    {item.options.map((opt, optIdx) => (
                      <li key={optIdx} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3 space-y-2">
              <p className="font-medium text-zinc-100">Answer Key</p>
              {Array.isArray(answer_key) && answer_key.length > 0 ? (
                <ul className="text-sm text-zinc-300 space-y-1.5">
                  {answer_key.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      <span>Q{item.number}: {item.answer}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="text-sm text-zinc-300 space-y-1.5">
                  {mcqs.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      <span>Q{idx + 1}: {item.answer}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-400">
            Generate MCQs after extracting text and summary bullets.
          </div>
        )}
      </Section>

      <div className="sticky bottom-4 z-20">
        <div className="glass-panel bg-gradient-to-b from-zinc-900 to-black rounded-xl border border-white/10 px-4 py-3">
          {mcqLoading ? (
            <div className="mb-3 h-[2px] bg-white/10 overflow-hidden">
              <motion.div
                className="h-full w-1/4 bg-white/60"
                animate={{ x: ["-120%", "420%"] }}
                transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            <label htmlFor="mcq-count" className="text-sm text-zinc-400 whitespace-nowrap">
              How many questions?
            </label>
            <select
              id="mcq-count"
              value={mcqCount}
              onChange={(event) => onMcqCountChange(Number(event.target.value))}
              className="h-10 min-w-24 rounded-lg border border-white/10 bg-transparent px-3 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count} className="bg-white text-black">
                  {count}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onGenerateMcq}
              disabled={mcqLoading || !original_text}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              {mcqLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
