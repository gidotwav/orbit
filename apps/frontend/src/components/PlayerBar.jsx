import React from "react";
import { List, Pause, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";

export function PlayerBar() {
  return (
    <footer className="sticky bottom-0 z-20 px-5 pb-5 md:px-8">
      <section className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 rounded-[22px] bg-[#4d4849] px-5 py-4 text-white shadow-2xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-11 rounded-xl bg-[linear-gradient(135deg,#9b3e1f,#f2d45c)]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Velvet Orbit</p>
            <p className="truncate text-xs text-white/45">LUNA.EXE</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Shuffle size={16} className="text-white/45" />
          <SkipBack size={18} />
          <button className="grid size-9 place-items-center rounded-full bg-[#f4ef62] text-[#29270e]">
            <Pause size={16} fill="currentColor" />
          </button>
          <SkipForward size={18} />
          <Repeat size={16} className="text-white/45" />
        </div>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <div className="h-1.5 w-32 rounded-full bg-white/15">
            <div className="h-full w-2/3 rounded-full bg-[#f4ef62]" />
          </div>
          <Volume2 size={17} />
          <List size={17} />
        </div>
      </section>
    </footer>
  );
}
