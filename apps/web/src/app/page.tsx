import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { VideoUploadCard } from "@/features/upload/VideoUploadCard";
import { Sparkles, Shield, Cpu, Sliders, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open-Source & Local-First Processing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-textPrimary tracking-tight leading-tight">
            Malayalam Speech to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              English Subtitles
            </span>
          </h1>

          <p className="text-sm sm:text-base text-textSecondary mt-4 leading-relaxed">
            Extract audio, accurately transcribe Malayalam audio, verify regional farming
            terminology, and export synchronized SRT / WebVTT subtitle files.
          </p>
        </div>

        {/* Upload Card */}
        <VideoUploadCard />

        {/* Phase 1 Mock / Demo Project Callout */}
        <div className="mt-8 text-center">
          <Link
            href="/projects/demo"
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-surfaceSubtle hover:bg-surfaceBorder/60 border border-surfaceBorder px-4 py-2 rounded-xl transition shadow-sm"
          >
            <span>Open interactive preview editor (Sample Project)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Value pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 w-full">
          <div className="p-4 rounded-xl bg-surface border border-surfaceBorder">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-textPrimary">Zero Paid Cloud Fees</h2>
            <p className="text-xs text-textMuted mt-1 leading-relaxed">
              Designed to run locally with open-source models (Faster-Whisper & NLLB). No mandatory API key.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-surfaceBorder">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-textPrimary">Review Malayalam First</h2>
            <p className="text-xs text-textMuted mt-1 leading-relaxed">
              Verify and correct spoken Malayalam terms before English translation to maintain nuance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-surfaceBorder">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-3">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-textPrimary">Precise Cue Editing</h2>
            <p className="text-xs text-textMuted mt-1 leading-relaxed">
              Synchronized video playback, visual timeline, millisecond adjustment, and one-click SRT/VTT export.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-surfaceBorder py-4 text-center text-xs text-textMuted">
        Malayalam Subtitle AI • Phase 1 Monorepo & Design System
      </footer>
    </div>
  );
}
