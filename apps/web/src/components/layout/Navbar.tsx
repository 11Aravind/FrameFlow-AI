"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Film, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { apiClient, HealthStatus } from "@/lib/api-client";
import { APP_CONFIG } from "@/lib/config";

interface NavbarProps {
  projectName?: string;
  statusBadge?: React.ReactNode;
  rightActions?: React.ReactNode;
}

export function Navbar({ projectName, statusBadge, rightActions }: NavbarProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function checkBackend() {
    setIsChecking(true);
    try {
      const res = await apiClient.getHealth();
      setHealth(res);
    } catch {
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <header className="h-14 border-b border-surfaceBorder bg-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Film className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-textPrimary tracking-tight">
            {APP_CONFIG.appName}
          </span>
        </Link>

        {projectName && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-surfaceBorder">
            <span className="text-xs text-textMuted">Project:</span>
            <span className="text-xs font-medium text-textSecondary truncate max-w-[200px]">
              {projectName}
            </span>
          </div>
        )}

        {statusBadge}
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surfaceSubtle border border-surfaceBorder cursor-pointer hover:border-slate-700 transition"
          onClick={checkBackend}
          title={
            health
              ? `Backend v${health.version} connected | FFmpeg: ${health.ffmpegAvailable ? "Available" : "Not Found"}`
              : "Backend disconnected. Click to retry."
          }
        >
          {isChecking ? (
            <RefreshCw className="w-3 h-3 animate-spin text-textMuted" />
          ) : health ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Local Core</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Offline</span>
            </span>
          )}
        </div>

        {rightActions}
      </div>
    </header>
  );
}
