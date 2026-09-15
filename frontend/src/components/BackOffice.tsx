import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Shield,
  FileText,
  Clock,
  Settings,
  Users,
  Building2,
  Lock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import {
  Language,
  LoanApplication,
  CanonicalStatus,
  UserRole,
  ApplicationConfig,
  AuditEvent,
} from '../types';
import { STATUS_BADGE_CONFIG } from '../config/appConfig';
import { storageService } from '../services/storage';
import { t } from '../i18n/translations';

interface BackOfficeProps {
  language: Language;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onCloseBackOffice: () => void;
}

export const BackOffice: React.FC<BackOfficeProps> = ({
  language,
  currentRole,
  onRoleChange,
  onCloseBackOffice,
}) => {
  const [applications, setApplications] = useState<LoanApplication[]>(() =>
    storageService.getAllApplications()
  );
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'applications' | 'audit' | 'config'>('applications');

  // Review modal actions
  const [reviewReason, setReviewReason] = useState('');
  const [missingDocNote, setMissingDocNote] = useState('');
  const [showDocNoteInput, setShowDocNoteInput] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Config editor state
  const [config, setConfig] = useState<ApplicationConfig>(() => storageService.getConfig());
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => storageService.getAuditEvents());

  const reloadData = () => {
    setApplications(storageService.getAllApplications());
    setAuditEvents(storageService.getAuditEvents());
    if (selectedApp) {
      const fresh = storageService.getApplication(selectedApp.id);
      setSelectedApp(fresh);
    }
  };

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      app.requestNumber.toLowerCase().includes(q) ||
      app.borrowerDetails?.fullName.toLowerCase().includes(q) ||
      app.borrowerDetails?.passportNumber.toLowerCase().includes(q) ||
      app.borrowerDetails?.mobilePhoneNumber?.includes(q) ||
      app.borrowerDetails?.countryOfOrigin.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (newStatus: CanonicalStatus, reason?: string, missingNote?: string) => {
    if (!selectedApp) return;

    const updated = storageService.updateApplicationStatus(
      selectedApp.id,
      newStatus,
      currentRole as any,
      `${currentRole.replace('_', ' ').toUpperCase()}_USER`,
      reason || reviewReason,
      missingNote || missingDocNote
    );

    setActionSuccessMessage(`Application status updated to ${newStatus}`);
    setReviewReason('');
    setMissingDocNote('');
    setShowDocNoteInput(false);
    reloadData();
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleFundingHandoff = () => {
    if (!selectedApp) return;
    storageService.simulateFundingHandoff(selectedApp.id, `FundingOfficer (${currentRole})`);
    setActionSuccessMessage('Application successfully pushed to Bank Leumi FinTech Gateway!');
    reloadData();
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleDownloadSignedJson = () => {
    if (!selectedApp) return;
    const jsonStr = storageService.exportSignedJson(selectedApp.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedApp.requestNumber}_signed_bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvStr = storageService.exportApplicationsCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickloan_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateConfig(config);
    setActionSuccessMessage('System configuration and credit policy updated successfully.');
    reloadData();
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col animate-in fade-in">
      {/* Top Admin Navigation Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">QuickLoan Israel</span>
                <span className="text-[10px] bg-purple-900/80 text-purple-200 border border-purple-700 px-2 py-0.5 rounded-full font-mono uppercase">
                  Back-Office Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Foreign Worker Lending Operations Workbench
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* RBAC Role Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-xs font-bold text-purple-300 focus:outline-none cursor-pointer capitalize"
              >
                <option value="borrower" className="bg-slate-900 text-white">Borrower View</option>
                <option value="customer_service" className="bg-slate-900 text-white">Customer Service (CSR)</option>
                <option value="credit_reviewer" className="bg-slate-900 text-white">Credit Reviewer</option>
                <option value="system_admin" className="bg-slate-900 text-white">System Admin</option>
                <option value="funding_entity" className="bg-slate-900 text-white">Funding Entity Partner</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onCloseBackOffice}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              Return to Borrower View
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'applications'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Loan Applications ({applications.length})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 inline mr-1.5" />
              Immutable Audit Logs ({auditEvents.length})
            </button>

            {(currentRole === 'system_admin' || currentRole === 'credit_reviewer') && (
              <button
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'config'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
                Credit Policy & Config
              </button>
            )}
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            Export CSV
          </button>
        </div>

        {actionSuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: Applications Table & Search */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Request Number, Name, Passport, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-purple-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses ({applications.length})</option>
                  <option value="Received">Received</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Additional Document Required">Additional Document Required</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Forwarded to Funding Entity">Forwarded to Funding Entity</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Request #</th>
                      <th className="py-3 px-4">Borrower Name</th>
                      <th className="py-3 px-4">Passport & Origin</th>
                      <th className="py-3 px-4">Visa & Tenure</th>
                      <th className="py-3 px-4 text-right">Loan Request (₪)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApps.length > 0 ? (
                      filteredApps.map((app) => {
                        const sCfg = STATUS_BADGE_CONFIG[app.status] || STATUS_BADGE_CONFIG['Received'];
                        return (
                          <tr
                            key={app.id}
                            className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                            onClick={() => setSelectedApp(app)}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-purple-950">
                              {app.requestNumber}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {app.borrowerDetails?.fullName || 'Anonymous Draft'}
                              <div className="text-[10px] text-slate-400 font-normal">
                                {app.borrowerDetails?.mobilePhoneNumber}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-mono">{app.borrowerDetails?.passportNumber}</span>
                              <span className="text-[11px] text-slate-500 block">
                                {app.borrowerDetails?.countryOfOrigin}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800">{app.residencyDetails?.visaType}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {app.residencyDetails?.yearsOfResidency || 0} yrs in Israel
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="font-mono font-extrabold text-blue-900">
                                ₪{app.loanRequest?.requestedAmountNis?.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {app.loanRequest?.repaymentPeriodMonths} mos @ ₪{app.loanRequest?.estimatedMonthlyPaymentNis}/mo
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${sCfg.badgeColor}`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(app);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-900 font-bold text-xs inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No loan applications match the active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Immutable Audit Trail */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-700" />
                Immutable System Audit Trail
              </h3>
              <span className="text-xs text-slate-400 font-mono">Total records: {auditEvents.length}</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {auditEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded text-[10px]">
                        {evt.action}
                      </span>
                      <span className="font-semibold text-slate-800">
                        Actor: {evt.actorName || evt.actorType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Entity: <span className="font-mono">{evt.entityType}/{evt.entityId}</span>
                    </div>
                    {evt.metadata && (
                      <pre className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto max-w-xl">
                        {JSON.stringify(evt.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(evt.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Credit Policy Configuration */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-2xl mx-auto space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Credit Policy & Operational Parameters</h3>
              <p className="text-xs text-slate-500">Modify lending constraints without redeploying code.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Min Loan Amount (₪)</label>
                <input
                  type="number"
                  value={config.minLoanAmountNis}
                  onChange={(e) => setConfig({ ...config, minLoanAmountNis: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Max Loan Amount (₪)</label>
                <input
                  type="number"
                  value={config.maxLoanAmountNis}
                  onChange={(e) => setConfig({ ...config, maxLoanAmountNis: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Min Borrower Age (Years)</label>
                <input
                  type="number"
                  value={config.minBorrowerAge}
                  onChange={(e) => setConfig({ ...config, minBorrowerAge: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Visa Validity Buffer (Months)</label>
                <input
                  type="number"
                  value={config.minVisaValidityMonths}
                  onChange={(e) => setConfig({ ...config, minVisaValidityMonths: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default APR (%)</label>
                <input
                  type="number"
                  step={0.1}
                  value={config.defaultInterestRatePercent}
                  onChange={(e) => setConfig({ ...config, defaultInterestRatePercent: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Management Fee (₪)</label>
                <input
                  type="number"
                  value={config.managementFeeNis}
                  onChange={(e) => setConfig({ ...config, managementFeeNis: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs"
              >
                Save Configuration Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Application Detail Inspection & Action Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-purple-300">
                    {selectedApp.requestNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      STATUS_BADGE_CONFIG[selectedApp.status]?.badgeColor
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Submitted: {new Date(selectedApp.createdAt).toLocaleDateString()} • Lang: {selectedApp.language.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSignedJson}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-purple-200 border border-slate-700 flex items-center gap-1"
                  title="Download cryptographic signed JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Borrower & Residency Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                    Borrower Profile
                  </div>
                  <div><span className="text-slate-400">Full Name:</span> <span className="font-bold text-slate-900">{selectedApp.borrowerDetails?.fullName}</span></div>
                  <div><span className="text-slate-400">Passport:</span> <span className="font-mono font-bold">{selectedApp.borrowerDetails?.passportNumber}</span></div>
                  <div><span className="text-slate-400">Origin & DOB:</span> {selectedApp.borrowerDetails?.countryOfOrigin} ({selectedApp.borrowerDetails?.dateOfBirth})</div>
                  <div><span className="text-slate-400">Phone:</span> {selectedApp.borrowerDetails?.mobilePhoneNumber}</div>
                  <div><span className="text-slate-400">Address:</span> {selectedApp.borrowerDetails?.addressFull}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                    Residency & Employment
                  </div>
                  <div><span className="text-slate-400">Visa Type:</span> <span className="font-bold">{selectedApp.residencyDetails?.visaType}</span></div>
                  <div><span className="text-slate-400">Visa Expiry:</span> {selectedApp.residencyDetails?.visaExpiryDate}</div>
                  <div><span className="text-slate-400">Years in Israel:</span> {selectedApp.residencyDetails?.yearsOfResidency} yrs</div>
                  <div><span className="text-slate-400">Employer:</span> {selectedApp.employmentDetails?.employerName}</div>
                  <div><span className="text-slate-400">Monthly Salary:</span> <span className="font-mono font-bold text-emerald-800">₪{selectedApp.employmentDetails?.monthlySalaryNis?.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="p-4 rounded-2xl bg-blue-950 text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-blue-300 uppercase tracking-wider font-bold">Requested Loan Amount</div>
                  <div className="text-2xl font-extrabold font-mono text-white">₪{selectedApp.loanRequest?.requestedAmountNis?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[11px] text-blue-300 uppercase tracking-wider font-bold">Term & Plan</div>
                  <div className="text-sm font-bold">{selectedApp.loanRequest?.repaymentPeriodMonths} Months @ ₪{selectedApp.loanRequest?.estimatedMonthlyPaymentNis}/mo</div>
                </div>
                <div>
                  <div className="text-[11px] text-blue-300 uppercase tracking-wider font-bold">Total Repayment</div>
                  <div className="text-lg font-bold font-mono text-blue-100">₪{selectedApp.loanRequest?.totalRepaymentNis?.toLocaleString()}</div>
                </div>
              </div>

              {/* Uploaded Documents Gallery & OCR verification */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Uploaded Documents ({selectedApp.documents?.length || 0})
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {selectedApp.documents?.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">{doc.documentTypeCode}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                          {doc.qualityStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{doc.originalFilename}</div>
                      {doc.ocrExtractedData && (
                        <div className="text-[10px] text-blue-900 bg-blue-50 p-1.5 rounded border border-blue-100 font-mono">
                          OCR: {doc.ocrExtractedData.passportNumber || doc.ocrExtractedData.visaExpiryDate || 'Extracted'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History & Audit Notes */}
              <div className="space-y-2 border-t pt-3">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Underwriting & Lifecycle History
                </div>
                <div className="space-y-1.5">
                  {selectedApp.statusHistory?.map((h) => (
                    <div key={h.id} className="p-2 rounded-lg bg-slate-100 text-[11px] flex justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{h.toStatus}</span> — {h.reason || 'Status updated'}
                        <span className="text-slate-400 block text-[10px]">By: {h.changedByName || h.changedByType}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[10px]">{new Date(h.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Action Controls (Role-Based) */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                <div className="font-bold text-purple-950 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Underwriting Actions ({currentRole.toUpperCase()})</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter review reason / decision notes..."
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-slate-800"
                  />
                </div>

                {showDocNoteInput && (
                  <div className="space-y-1 animate-in fade-in">
                    <label className="text-[11px] font-bold text-amber-900">Missing Document Request Message:</label>
                    <input
                      type="text"
                      placeholder="e.g. Please provide last 3 months bank statements showing regular salary deposits"
                      value={missingDocNote}
                      onChange={(e) => setMissingDocNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Credit Reviewer Actions */}
                  {(currentRole === 'credit_reviewer' || currentRole === 'system_admin') && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange('Approved', 'Loan criteria satisfied and credit risk approved.')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Loan
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!showDocNoteInput) {
                            setShowDocNoteInput(true);
                          } else {
                            handleStatusChange('Additional Document Required', 'Additional documentation requested.', missingDocNote);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {showDocNoteInput ? 'Send Missing Doc Request' : 'Request Addl Document'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange('Rejected', reviewReason || 'Underwriting criteria not met.')}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Loan
                      </button>
                    </>
                  )}

                  {/* Funding Entity Partner Action */}
                  {(currentRole === 'funding_entity' || currentRole === 'system_admin' || currentRole === 'credit_reviewer') && (
                    <button
                      type="button"
                      onClick={handleFundingHandoff}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Push to Funding Partner
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
