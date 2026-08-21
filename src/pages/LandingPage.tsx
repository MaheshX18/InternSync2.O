import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { GraduationCap, Building2, ShieldCheck, ArrowRight, CheckCircle2, Layers, Cpu, Lock, Database } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div id="landing-page-container" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Hero Section */}
      <section id="hero-section" className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div id="hero-content" className="relative max-w-4xl mx-auto text-center space-y-6">
          <div id="hero-pill-badge" className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            PHASE 1: Project Setup Complete
          </div>

          <h1 id="hero-main-title" className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Bridging the Gap Between <span className="text-indigo-600">Talent</span> and <span className="text-indigo-600">Opportunity</span>
          </h1>

          <p id="hero-description" className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            The unified ecosystem for university students to find professional internships, for companies to source top talent, and for administrators to manage growth.
          </p>

          {/* Health Status Verification Card */}
          <div id="hero-health-status-wrapper" className="pt-4 max-w-3xl mx-auto">
            <StatusBadge />
          </div>
        </div>
      </section>

      {/* Role Breakdown Section */}
      <section id="roles-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div id="roles-header" className="text-center max-w-2xl mx-auto mb-12">
          <h2 id="roles-title" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tailored Workflows for Every Role
          </h2>
          <p id="roles-subtitle" className="text-sm text-slate-600 mt-2">
            Role-based access control engine powering three dedicated user experiences.
          </p>
        </div>

        <div id="roles-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Role */}
          <div id="role-card-student" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 id="role-title-student" className="text-xl font-bold text-slate-800 mb-2">For Students</h3>
            <p id="role-desc-student" className="text-sm text-slate-500 leading-relaxed mb-6">
              Apply for top-tier roles, track applications in real-time, and build your career portfolio directly with universities.
            </p>
            <ul className="space-y-2.5 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Search & Filter Opportunities</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Real-Time Application Tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Skill Portfolio Management</li>
            </ul>
          </div>

          {/* Company Role */}
          <div id="role-card-company" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 id="role-title-company" className="text-xl font-bold text-slate-800 mb-2">For Companies</h3>
            <p id="role-desc-company" className="text-sm text-slate-500 leading-relaxed mb-6">
              Publish opportunities, manage candidates with advanced pipeline tools, and streamline your recruitment workflow.
            </p>
            <ul className="space-y-2.5 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Publish & Manage Postings</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Review Candidate Pipelines</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Status Updates & Decisioning</li>
            </ul>
          </div>

          {/* Admin Role */}
          <div id="role-card-admin" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 id="role-title-admin" className="text-xl font-bold text-slate-800 mb-2">For Admins</h3>
            <p id="role-desc-admin" className="text-sm text-slate-500 leading-relaxed mb-6">
              Complete platform control, user verification, analytic dashboards, and compliance management for the university.
            </p>
            <ul className="space-y-2.5 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> User Verification & Auditing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Content Moderation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Analytics & Reporting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Architecture Stack */}
      <section id="tech-section" className="py-12 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div id="tech-container" className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">Layered Full-Stack Architecture</h2>
            <p className="text-xs text-slate-500 mt-1">Enterprise Spring Boot 3.2 + MongoDB backend with modern React 19 SPA frontend.</p>
          </div>

          <div id="tech-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Cpu className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">Spring Boot 3.2</h4>
              <p className="text-[11px] text-slate-500">Java 17 REST Service</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Database className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">MongoDB 7.0</h4>
              <p className="text-[11px] text-slate-500">Document Database</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Lock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">Spring Security</h4>
              <p className="text-[11px] text-slate-500">Stateless JWT Auth</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Layers className="w-6 h-6 text-slate-700 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">React 19 + Vite</h4>
              <p className="text-[11px] text-slate-500">Tailwind v4 CSS</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
