import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div id="not-found-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <div id="not-found-icon-box" className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 id="not-found-code" className="text-5xl font-black text-white tracking-tight mb-2">404</h1>
      <h2 id="not-found-title" className="text-xl font-bold text-slate-300 mb-4">Page Not Found</h2>
      <p id="not-found-desc" className="text-sm text-slate-400 max-w-md mb-8">
        The requested URL does not exist or has been moved. Return to the InternSync main overview.
      </p>
      <Link
        id="not-found-back-btn"
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to InternSync Overview
      </Link>
    </div>
  );
};
