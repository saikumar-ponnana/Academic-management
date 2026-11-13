import React from 'react';

const HeaderBanner = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-50">
      {/* Top subtle bar with Estd dates */}
      <div className="bg-[#0e387a] text-white/95 text-[10px] sm:text-[11px] font-semibold tracking-wider px-3 sm:px-6 py-0.5 sm:py-1">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
            <span>GVP — Estd. 1988</span>
          </span>
          <span className="text-amber-300 font-bold hidden sm:inline text-[10px] uppercase tracking-widest">
            ELC Center • Academic Portal
          </span>
          <span className="flex items-center space-x-1.5">
            <span>GVPIHLR — Estd. 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
          </span>
        </div>
      </div>

      {/* Main Branding Header with Crest & Institutional Typography */}
      <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-center">
        <div className="flex items-center space-x-3 sm:space-x-5 text-center sm:text-left">
          {/* Official GVP Emblem */}
          <img
            src="/assets/gvp_emblem.png"
            alt="Gayatri Vidya Parishad Emblem"
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain shrink-0 drop-shadow-xs"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          {/* Institutional Typography */}
          <div className="flex flex-col items-center sm:items-start leading-tight">
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#0e387a] uppercase tracking-wide font-serif">
              Gayatri Vidya Parishad
            </h1>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 tracking-wide mt-0.5 uppercase">
              Institute of Higher Learning and Research
            </h2>
            <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
              (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956)
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-normal mt-0.5">
              Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBanner;
