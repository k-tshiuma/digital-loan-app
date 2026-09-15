import React, { useEffect } from 'react';
import { CheckCircle2, Copy, ArrowRight, ShieldCheck, Clock, MessageSquare, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, LoanApplication } from '../types';
import { t } from '../i18n/translations';

interface Step10SubmissionSuccessProps {
  language: Language;
  application: LoanApplication;
  onTrackStatus: () => void;
}

export const Step10SubmissionSuccess: React.FC<Step10SubmissionSuccessProps> = ({
  language,
  application,
  onTrackStatus,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Fire confetti cannon
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  const handleCopyRequestNumber = () => {
    if (application.requestNumber) {
      navigator.clipboard.writeText(application.requestNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full py-4 text-center animate-in fade-in zoom-in-95 duration-400">
      {/* Big Success Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        {t(language, 'applicationSubmittedTitle')}
      </h1>
      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
        {t(language, 'applicationSubmittedSubtitle')}
      </p>

      {/* Prominent Request Number Badge */}
      <div className="my-6 p-4 rounded-2xl bg-blue-50/90 border border-blue-200/80 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
          {t(language, 'yourRequestNumber')}
        </span>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-black font-mono text-blue-950 tracking-wider">
            {application.requestNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyRequestNumber}
            className="p-1.5 rounded-lg bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors"
            title="Copy Request Number"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {t(language, 'keepRequestNumberNotice')}
        </p>
      </div>

      {/* Next Steps List */}
      <div className="text-left space-y-3 mb-8">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {t(language, 'nextStepsTitle')}
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block">1. Underwriting Review</span>
            Initial document verification within 1–2 business days.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
          <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block">2. SMS Updates in Your Language</span>
            Status notifications will be sent directly to your registered phone.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block">3. Final Loan Agreement & Funding</span>
            Upon approval, funds will be transferred via the selected Israeli financial provider.
          </div>
        </div>
      </div>

      {/* Primary Track Action */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          id="track-status-primary-btn"
          onClick={onTrackStatus}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t(language, 'trackApplicationStatus')}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
