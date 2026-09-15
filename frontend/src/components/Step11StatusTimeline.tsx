import React, { useState, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Camera,
  MessageSquare,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Language, LoanApplication, CanonicalStatus, UploadedFile, NotificationItem } from '../types';
import { STATUS_BADGE_CONFIG } from '../config/appConfig';
import { t } from '../i18n/translations';
import { storageService } from '../services/storage';

interface Step11StatusTimelineProps {
  language: Language;
  application: LoanApplication;
  onApplicationUpdated: (app: LoanApplication) => void;
  onStartNewApplication: () => void;
}

export const Step11StatusTimeline: React.FC<Step11StatusTimelineProps> = ({
  language,
  application,
  onApplicationUpdated,
  onStartNewApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'notifications' | 'details'>('timeline');
  const [isUploadingMissing, setIsUploadingMissing] = useState(false);
  const [missingDocType, setMissingDocType] = useState('BANK_STATEMENT');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const statusConfig = STATUS_BADGE_CONFIG[application.status] || STATUS_BADGE_CONFIG['Received'];
  const notifications = storageService.getNotifications(application.userId);

  const handleUploadMissingDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newDoc: UploadedFile = {
      id: `doc_addl_${Date.now()}`,
      applicationId: application.id,
      documentTypeCode: missingDocType as any,
      originalFilename: file.name,
      mimeType: file.type || 'application/pdf',
      fileSizeBytes: file.size || 250000,
      storageKey: `s3://quickloan-docs/${application.id}/${file.name}`,
      uploadSource: 'file',
      qualityStatus: 'passed',
      ocrStatus: 'not_requested',
      userConfirmed: true,
      uploadedAt: new Date().toISOString(),
    };

    const updatedDocs = [...(application.documents || []), newDoc];
    application.documents = updatedDocs;

    // Update status back to 'Under Review' once additional document is uploaded
    const updatedApp = storageService.updateApplicationStatus(
      application.id,
      'Under Review',
      'credit_reviewer',
      'Automated Intake System',
      `Borrower uploaded additional document: ${file.name}`
    );

    onApplicationUpdated(updatedApp);
    setUploadSuccessMessage('Document uploaded successfully! Application is now Under Review.');
    setIsUploadingMissing(false);
    setTimeout(() => setUploadSuccessMessage(null), 4000);
  };

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleUploadMissingDoc}
      />

      {/* Header & Request Number */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t(language, 'statusTimelineTitle')}
          </span>
          <h1 className="text-xl font-bold font-mono text-slate-900">
            {application.requestNumber}
          </h1>
        </div>

        {/* Status Pill */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${statusConfig.badgeColor}`}
        >
          {application.status}
        </span>
      </div>

      {/* Status Hero Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {application.status === 'Received' && t(language, 'statusReceivedTitle')}
              {application.status === 'Under Review' && t(language, 'statusUnderReviewTitle')}
              {application.status === 'Additional Document Required' && t(language, 'statusAdditionalDocTitle')}
              {application.status === 'Approved' && t(language, 'statusApprovedTitle')}
              {application.status === 'Rejected' && t(language, 'statusRejectedTitle')}
              {application.status === 'Forwarded to Funding Entity' && t(language, 'statusForwardedTitle')}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {application.missingDocumentNotes || (
                application.status === 'Received' ? t(language, 'statusReceivedDesc') :
                application.status === 'Under Review' ? t(language, 'statusUnderReviewDesc') :
                application.status === 'Additional Document Required' ? t(language, 'statusAdditionalDocDesc') :
                application.status === 'Approved' ? t(language, 'statusApprovedDesc') :
                application.status === 'Rejected' ? t(language, 'statusRejectedDesc') :
                t(language, 'statusForwardedDesc')
              )}
            </p>
          </div>
        </div>

        {/* Action button if Additional Document Required */}
        {application.status === 'Additional Document Required' && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              id="upload-missing-doc-btn"
              onClick={() => setIsUploadingMissing(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{t(language, 'uploadMissingDocument')}</span>
            </button>
          </div>
        )}

        {uploadSuccessMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            {uploadSuccessMessage}
          </div>
        )}
      </div>

      {/* Upload Missing Document Panel */}
      {isUploadingMissing && (
        <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            Select Document to Upload:
          </div>
          <select
            value={missingDocType}
            onChange={(e) => setMissingDocType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs text-slate-900"
          >
            <option value="BANK_STATEMENT">Bank Statement (Last 3 Months)</option>
            <option value="PAY_SLIP">Salary Pay Slip</option>
            <option value="EMPLOYMENT_CONFIRMATION">Employer Letter</option>
            <option value="PASSPORT">Passport Photo Page</option>
            <option value="WORK_VISA">Visa Sticker</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800"
            >
              Choose File / Camera
            </button>
            <button
              type="button"
              onClick={() => setIsUploadingMissing(false)}
              className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-700 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sub-tabs: Timeline, Notifications, Summary Details */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
            activeTab === 'timeline'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t(language, 'timelineTab')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{t(language, 'notificationsTab')}</span>
          {notifications.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 text-[10px] flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
            activeTab === 'details'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Loan Package
        </button>
      </div>

      {/* Tab 1: Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-3 mb-6">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Status History Items */}
            {application.statusHistory && application.statusHistory.length > 0 ? (
              application.statusHistory.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-2xs ${
                      idx === 0 ? 'bg-blue-900 ring-2 ring-blue-100' : 'bg-slate-300'
                    }`}
                  />
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {item.toStatus}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-xs text-slate-600">{item.reason}</p>
                    )}
                    <div className="text-[10px] text-slate-400 font-medium">
                      By: {item.changedByName || item.changedByType}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500">
                Application successfully submitted. Initial review in progress.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-3 mb-6">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="uppercase font-semibold text-blue-900">Channel: {notif.channel}</span>
                  <span>•</span>
                  <span>Delivered via Mock SMS</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              No notifications yet. You will receive updates here and via SMS.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Loan Package Details */}
      {activeTab === 'details' && (
        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 border-b pb-1">Borrower Information</div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div><span className="text-slate-400 block">Name:</span> {application.borrowerDetails?.fullName}</div>
              <div><span className="text-slate-400 block">Passport:</span> {application.borrowerDetails?.passportNumber}</div>
              <div><span className="text-slate-400 block">Origin:</span> {application.borrowerDetails?.countryOfOrigin}</div>
              <div><span className="text-slate-400 block">Salary:</span> ₪{application.employmentDetails?.monthlySalaryNis?.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 border-b pb-1">Loan Parameters</div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div><span className="text-slate-400 block">Requested Amount:</span> <span className="font-bold font-mono">₪{application.loanRequest?.requestedAmountNis?.toLocaleString()}</span></div>
              <div><span className="text-slate-400 block">Term:</span> {application.loanRequest?.repaymentPeriodMonths} Months</div>
              <div><span className="text-slate-400 block">Monthly Repayment:</span> ₪{application.loanRequest?.estimatedMonthlyPaymentNis}</div>
              <div><span className="text-slate-400 block">Repayment Source:</span> {application.loanRequest?.repaymentSource}</div>
            </div>
          </div>
        </div>
      )}

      {/* Start New / Reset Application Option */}
      <div className="mt-auto pt-4 text-center">
        <button
          type="button"
          onClick={onStartNewApplication}
          className="text-xs text-slate-500 hover:text-blue-900 font-semibold underline"
        >
          {t(language, 'startNewApplication')}
        </button>
      </div>
    </div>
  );
};
