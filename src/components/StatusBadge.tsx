import React, { useEffect, useState } from 'react';
import { checkHealth } from '../api/client';
import { HealthData } from '../types';
import { Server, Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const StatusBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkHealth();
      if (res.success) {
        setHealth(res.data);
      } else {
        setError('Backend returned unsuccessful health check.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Spring Boot backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="status-card" className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <div id="status-card-header" className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 id="status-card-title" className="text-sm font-semibold text-slate-800">
              Architecture Health Verification (Phase 1)
            </h3>
            <p id="status-card-subtitle" className="text-xs text-slate-500">
              Live status from Spring Boot REST API (/api/v1/health)
            </p>
          </div>
        </div>

        <button
          id="status-refresh-btn"
          onClick={fetchHealth}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div id="status-card-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* Backend Status */}
        <div id="status-item-backend" className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Spring Boot Service</p>
              <p className="text-sm font-bold text-slate-800">{health?.service || 'Spring Boot API'}</p>
            </div>
          </div>
          {health?.status === 'UP' ? (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> UP
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> {loading ? 'Checking...' : 'OFFLINE'}
            </span>
          )}
        </div>

        {/* Database Status */}
        <div id="status-item-database" className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">MongoDB Database</p>
              <p className="text-sm font-bold text-slate-800">
                {health?.database?.includes('CONNECTED') ? 'MongoDB 7.0 (Local)' : 'Checking DB...'}
              </p>
            </div>
          </div>
          {health?.database?.includes('CONNECTED') ? (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> {loading ? 'Checking...' : 'PENDING'}
            </span>
          )}
        </div>

        {/* OpenAPI Status */}
        <div id="status-item-swagger" className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">OpenAPI / Swagger</p>
              <p className="text-sm font-bold text-slate-800">v3.0 Documentation</p>
            </div>
          </div>
          <a
            id="status-swagger-link"
            href="/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            Open Docs
          </a>
        </div>
      </div>

      {error && (
        <div id="status-error-msg" className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
