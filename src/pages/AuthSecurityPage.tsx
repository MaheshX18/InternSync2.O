import React, { useState } from 'react';
import { ShieldCheck, Key, Lock, UserCheck, RefreshCw, LogOut, CheckCircle2, AlertTriangle, Terminal, Cpu } from 'lucide-react';

export const AuthSecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'jwt' | 'roles' | 'security'>('console');
  const [email, setEmail] = useState('student.alex@university.edu');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<'STUDENT' | 'COMPANY' | 'ADMIN'>('STUDENT');
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Rivera');
  const [adminSecretKey, setAdminSecretKey] = useState('InternSyncAdminMasterKey2026');

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [apiLog, setApiLog] = useState<{ endpoint: string; method: string; status: number; response: any; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const logResponse = (endpoint: string, method: string, status: number, response: any) => {
    setApiLog(prev => [
      {
        endpoint,
        method,
        status,
        response,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
          adminSecretKey: role === 'ADMIN' ? adminSecretKey : undefined,
        }),
      });
      const data = await res.json();
      logResponse('/api/v1/auth/register', 'POST', res.status, data);
      if (data.success && data.data) {
        setAccessToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
        setCurrentUser({ email: data.data.email, role: data.data.role, id: data.data.userId });
      }
    } catch (err: any) {
      logResponse('/api/v1/auth/register', 'POST', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      logResponse('/api/v1/auth/login', 'POST', res.status, data);
      if (data.success && data.data) {
        setAccessToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
        setCurrentUser({ email: data.data.email, role: data.data.role, id: data.data.userId });
      }
    } catch (err: any) {
      logResponse('/api/v1/auth/login', 'POST', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'GET',
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      });
      const data = await res.json();
      logResponse('/api/v1/users/me', 'GET', res.status, data);
    } catch (err: any) {
      logResponse('/api/v1/users/me', 'GET', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestRoleEndpoint = async (roleType: 'student' | 'company' | 'admin') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/test/${roleType}`, {
        method: 'GET',
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      });
      const data = await res.json();
      logResponse(`/api/v1/test/${roleType}`, 'GET', res.status, data);
    } catch (err: any) {
      logResponse(`/api/v1/test/${roleType}`, 'GET', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken || 'invalid-token' }),
      });
      const data = await res.json();
      logResponse('/api/v1/auth/refresh', 'POST', res.status, data);
      if (data.success && data.data) {
        setAccessToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
      }
    } catch (err: any) {
      logResponse('/api/v1/auth/refresh', 'POST', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      logResponse('/api/v1/auth/logout', 'POST', res.status, data);
      setAccessToken(null);
      setRefreshToken(null);
      setCurrentUser(null);
    } catch (err: any) {
      logResponse('/api/v1/auth/logout', 'POST', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Decode JWT payload for visualization
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const parsedToken = accessToken ? parseJwt(accessToken) : null;

  return (
    <div id="auth-security-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
              PHASE 2: AUTHENTICATION & SECURITY
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Security & Token Verification Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Production Spring Security 6, JWT Stateless Auth, MongoDB Refresh Token Rotation & Role-Based Access Control.
          </p>
        </div>

        {/* Current Auth Status Badge */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center gap-4 min-w-[260px]">
          <div className={`p-3 rounded-full ${currentUser ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Authentication State</div>
            {currentUser ? (
              <div>
                <span className="text-sm font-bold text-emerald-400">{currentUser.email}</span>
                <div className="text-[10px] font-mono font-semibold text-indigo-400 uppercase">ROLE: {currentUser.role}</div>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">Not Authenticated</span>
            )}
          </div>
        </div>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Password Security</h3>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">BCrypt Hashing</p>
            <p className="text-xs text-slate-500 mt-1">Plaintext passwords never saved</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Token</h3>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">HMAC-SHA256 JWT</p>
            <p className="text-xs text-slate-500 mt-1">Stateless claim verification</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Refresh Token</h3>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">MongoDB Rotation</p>
            <p className="text-xs text-slate-500 mt-1">Single-session refresh rotation</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Authorization</h3>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">@PreAuthorize</p>
            <p className="text-xs text-slate-500 mt-1">STUDENT, COMPANY, ADMIN</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Form & Endpoint Triggers (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              Auth & Security Test Controls
            </h2>
            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">/api/v1/auth</span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Credential Presets</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('student.alex@university.edu');
                  setPassword('Password123!');
                  setRole('STUDENT');
                  setFirstName('Alex');
                  setLastName('Rivera');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
              >
                Student Preset
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('recruiter@techcorp.com');
                  setPassword('CompanySecret123!');
                  setRole('COMPANY');
                  setFirstName('Sarah');
                  setLastName('Jenkins');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 transition-colors"
              >
                Company Preset
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin.master@internsync.org');
                  setPassword('AdminSecurePassword2026!');
                  setRole('ADMIN');
                  setFirstName('System');
                  setLastName('Admin');
                  setAdminSecretKey('InternSyncAdminMasterKey2026');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
              >
                Admin Preset
              </button>
            </div>
          </div>

          {/* Request Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="COMPANY">COMPANY</option>
                <option value="ADMIN">ADMIN (Requires Secret Key)</option>
              </select>
            </div>

            {role === 'ADMIN' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Admin Master Security Key
                </label>
                <input
                  type="password"
                  value={adminSecretKey}
                  onChange={e => setAdminSecretKey(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                POST /auth/register
              </button>
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                POST /auth/login
              </button>
            </div>

            <button
              type="button"
              onClick={handleFetchProfile}
              disabled={loading}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
            >
              GET /users/me (Requires JWT)
            </button>

            {/* Role Protection Testing */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Test Role Authorization Rules</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTestRoleEndpoint('student')}
                  disabled={loading}
                  className="py-2 px-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold rounded border border-indigo-200"
                >
                  /test/student
                </button>
                <button
                  type="button"
                  onClick={() => handleTestRoleEndpoint('company')}
                  disabled={loading}
                  className="py-2 px-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold rounded border border-purple-200"
                >
                  /test/company
                </button>
                <button
                  type="button"
                  onClick={() => handleTestRoleEndpoint('admin')}
                  disabled={loading}
                  className="py-2 px-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-bold rounded border border-amber-200"
                >
                  /test/admin
                </button>
              </div>
            </div>

            {/* Token Management */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleRefreshToken}
                disabled={loading}
                className="py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded border border-emerald-200 flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Token
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded border border-red-200 flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Session
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: JWT Token Inspector & Live Console Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* JWT Claims Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                <Key className="w-4 h-4 text-amber-400" />
                Active JWT Token Claims Inspector
              </h2>
              {accessToken ? (
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  VALID JWT LOADED
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  NO JWT TOKEN
                </span>
              )}
            </div>

            {parsedToken ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Subject (sub)</span>
                    <span className="font-mono text-emerald-400 truncate block font-semibold">{parsedToken.sub}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">User Role</span>
                    <span className="font-mono text-indigo-400 font-bold block">{parsedToken.role}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Issued At (iat)</span>
                    <span className="font-mono text-slate-300 block">{new Date((parsedToken.iat || 0) * 1000).toLocaleTimeString()}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Expires At (exp)</span>
                    <span className="font-mono text-slate-300 block">{new Date((parsedToken.exp || 0) * 1000).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Raw JWT Access Token</span>
                  <p className="font-mono text-[11px] text-slate-400 break-all select-all bg-black/40 p-2 rounded">
                    {accessToken}
                  </p>
                </div>

                {refreshToken && (
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">MongoDB Persistent Refresh Token</span>
                    <p className="font-mono text-[11px] text-emerald-400 break-all select-all bg-black/40 p-2 rounded">
                      {refreshToken}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                No active JWT token present. Click <strong className="text-indigo-400">POST /auth/login</strong> or <strong className="text-indigo-400">POST /auth/register</strong> to generate tokens.
              </div>
            )}
          </div>

          {/* Live Response Console */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Live API Response Console Log ({apiLog.length})
              </h2>
              {apiLog.length > 0 && (
                <button
                  type="button"
                  onClick={() => setApiLog([])}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Clear Console
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {apiLog.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No requests executed yet. Trigger any button on the left to inspect live Spring Boot HTTP responses.
                </div>
              ) : (
                apiLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono space-y-2 ${
                      log.status >= 200 && log.status < 300
                        ? 'bg-emerald-950/5 border-emerald-200 text-emerald-950'
                        : log.status === 401 || log.status === 403
                        ? 'bg-amber-950/5 border-amber-200 text-amber-950'
                        : 'bg-red-950/5 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold border-b border-black/5 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-slate-800">{log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status >= 200 && log.status < 300 ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                        }`}>
                          HTTP {log.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{log.timestamp}</span>
                      </div>
                    </div>

                    <pre className="p-2.5 bg-slate-900 text-slate-200 rounded text-[11px] overflow-x-auto max-h-[180px] leading-relaxed">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
