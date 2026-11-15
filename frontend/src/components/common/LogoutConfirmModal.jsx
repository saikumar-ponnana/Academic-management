import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
      >
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <LogOut className="w-6 h-6" />
        </div>

        <div>
          <h3 id="logout-dialog-title" className="text-lg font-bold text-slate-900">
            Confirm Sign Out
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Are you sure you want to exit and log out of the ELC Academic Portal? You will need your password to log back in.
          </p>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md shadow-red-500/20 transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;

