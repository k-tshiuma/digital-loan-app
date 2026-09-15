import React, { useState, useRef, useEffect } from 'react';
import {
  FileCheck,
  Edit2,
  CheckCircle2,
  Shield,
  PenTool,
  Type,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { Language, LoanApplication, DigitalSignature, ConsentRecord } from '../types';
import { t } from '../i18n/translations';

interface Step9ReviewConfirmProps {
  language: Language;
  application: LoanApplication;
  onEditStep: (stepNumber: number) => void;
  onSubmit: (consents: ConsentRecord[], signature: DigitalSignature) => void;
  onBack: () => void;
}

export const Step9ReviewConfirm: React.FC<Step9ReviewConfirmProps> = ({
  language,
  application,
  onEditStep,
  onSubmit,
  onBack,
}) => {
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentCreditCheck, setConsentCreditCheck] = useState(false);
  const [signatureTab, setSignatureTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(
    application.borrowerDetails?.fullName || ''
  );
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Canvas drawing setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Deep blue stroke
    ctx.lineWidth = 2.5;
  }, [signatureTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!consentTerms || !consentCreditCheck) {
      setErrorMessage(t(language, 'consentRequiredError'));
      return;
    }

    if (signatureTab === 'draw' && !hasDrawn) {
      setErrorMessage(t(language, 'signatureRequiredError'));
      return;
    }

    if (signatureTab === 'type' && !typedName.trim()) {
      setErrorMessage(t(language, 'signatureRequiredError'));
      return;
    }

    setIsSubmitting(true);

    const canvas = canvasRef.current;
    const signatureDataUri =
      signatureTab === 'draw' && canvas ? canvas.toDataURL('image/png') : undefined;

    const signature: DigitalSignature = {
      id: `sig_${Date.now()}`,
      applicationId: application.id,
      signatureMethod: signatureTab === 'draw' ? 'drawn_touch' : 'typed_name',
      signatureValue: signatureTab === 'draw' ? 'DRAWN_SIGNATURE_DATA' : typedName.trim(),
      signatureDataUri,
      signedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Client Secure Socket)',
      deviceMetadata: `${navigator.userAgent.slice(0, 80)}`,
    };

    const consents: ConsentRecord[] = [
      {
        id: `con_terms_${Date.now()}`,
        applicationId: application.id,
        consentType: 'terms_and_conditions',
        consentVersion: '2026.1',
        consentGiven: true,
        givenAt: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      },
      {
        id: `con_credit_${Date.now()}`,
        applicationId: application.id,
        consentType: 'credit_check',
        consentVersion: '2026.1',
        consentGiven: true,
        givenAt: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      },
    ];

    setTimeout(() => {
      onSubmit(consents, signature);
    }, 600);
  };

  const b = application.borrowerDetails;
  const r = application.residencyDetails;
  const em = application.employmentDetails;
  const l = application.loanRequest;
  const g = application.guarantor;
  const docCount = application.documents?.length || 0;

  return (
    <>
      <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
        {/* Header */}
        <div className="space-y-1 mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t(language, 'reviewTitle')}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t(language, 'reviewSubtitle')}
        </p>
      </div>

      {/* Summary Review Sections */}
      <div className="space-y-3 mb-6">
        {/* Borrower Details Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">
              {t(language, 'borrowerDetailsTitle')}
            </span>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> {t(language, 'edit')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Name:</span>
              <span className="font-semibold text-slate-800">{b?.fullName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Passport:</span>
              <span className="font-mono font-bold text-slate-800">{b?.passportNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Origin & DOB:</span>
              <span className="text-slate-700">{b?.countryOfOrigin}, {b?.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Address:</span>
              <span className="text-slate-700 truncate block">{b?.addressFull || b?.addressCity || '—'}</span>
            </div>
          </div>
        </div>

        {/* Residency & Visa Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">
              {t(language, 'residencyDetailsTitle')}
            </span>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> {t(language, 'edit')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Visa Category:</span>
              <span className="font-semibold text-slate-800">{r?.visaType || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Visa Expiry:</span>
              <span className="font-semibold text-slate-800">{r?.visaExpiryDate || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Entry Date:</span>
              <span className="text-slate-700">{r?.dateOfEntry || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Time in Israel:</span>
              <span className="font-bold text-blue-900">{r?.yearsOfResidency || 0} years</span>
            </div>
          </div>
        </div>

        {/* Employment & Income Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">
              {t(language, 'employmentDetailsTitle')}
            </span>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> {t(language, 'edit')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Employer:</span>
              <span className="font-semibold text-slate-800 truncate block">{em?.employerName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Monthly Salary:</span>
              <span className="font-bold font-mono text-emerald-800">₪{em?.monthlySalaryNis?.toLocaleString() || 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tenure:</span>
              <span className="text-slate-700">{em?.jobTenureMonths || 0} months</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Payment Method:</span>
              <span className="text-slate-700">{em?.salaryPaymentMethod || '—'}</span>
            </div>
          </div>
        </div>

        {/* Loan Request Summary Card */}
        <div className="p-3.5 rounded-2xl bg-blue-950 text-white shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-blue-800 pb-2">
            <span className="text-xs font-bold text-blue-200">
              {t(language, 'loanDetailsTitle')}
            </span>
            <button
              type="button"
              onClick={() => onEditStep(6)}
              className="text-xs font-bold text-blue-300 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> {t(language, 'edit')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            <div>
              <span className="text-blue-300 block text-[11px]">Requested Amount:</span>
              <span className="text-lg font-bold font-mono text-white">₪{l?.requestedAmountNis?.toLocaleString() || 0}</span>
            </div>
            <div>
              <span className="text-blue-300 block text-[11px]">Repayment Term:</span>
              <span className="text-sm font-bold text-white">{l?.repaymentPeriodMonths || 6} Months</span>
            </div>
            <div>
              <span className="text-blue-300 block text-[11px]">Est. Monthly Payment:</span>
              <span className="font-mono font-bold text-blue-100">₪{l?.estimatedMonthlyPaymentNis || 0} / mo</span>
            </div>
            <div>
              <span className="text-blue-300 block text-[11px]">Total Repayment:</span>
              <span className="font-mono font-bold text-blue-100">₪{l?.totalRepaymentNis || 0}</span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents count */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-800">
              {docCount} Supporting Document{docCount !== 1 ? 's' : ''} Attached
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(8)}
            className="text-xs font-bold text-blue-900 hover:underline"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Mandatory Legal Consents */}
      <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-800 ">
          Legal Consents & Authorization
        </div>

        {/* Checkbox 1 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            id="consent-terms-cb"
            type="checkbox"
            checked={consentTerms}
            onChange={(e) => setConsentTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900 accent-blue-900"
          />
          <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed">
            {t(language, 'consentTermsText')}
          </span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            id="consent-credit-cb"
            type="checkbox"
            checked={consentCreditCheck}
            onChange={(e) => setConsentCreditCheck(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900 accent-blue-900"
          />
          <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed">
            {t(language, 'consentCreditCheckText')}
          </span>
        </label>
      </div>

      {/* Digital Signature Pad */}
      <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 ">
            {t(language, 'digitalSignatureLabel')} <span className="text-red-500">*</span>
          </label>
          {/* Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setSignatureTab('draw')}
              className={`px-3 py-1 rounded-md transition-all ${
                signatureTab === 'draw'
                  ? 'bg-white text-blue-900 font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <PenTool className="w-3 h-3 inline mr-1" />
              {t(language, 'drawSignature')}
            </button>
            <button
              type="button"
              onClick={() => setSignatureTab('type')}
              className={`px-3 py-1 rounded-md transition-all ${
                signatureTab === 'type'
                  ? 'bg-white text-blue-900 font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <Type className="w-3 h-3 inline mr-1" />
              {t(language, 'typeSignature')}
            </button>
          </div>
        </div>

        {signatureTab === 'draw' ? (
          <div className="space-y-2">
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden h-32 touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair block"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                  Sign with finger or stylus here
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">
                Draw full signature as on passport
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {t(language, 'clearSignature')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              id="typed-signature-input"
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type full legal name"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-serif text-lg text-blue-950 italic focus:border-blue-900 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 block">
              Typed name acts as binding legal electronic signature under Israeli e-Signature law.
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-auto pt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/3 py-3.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t(language, 'back')}</span>
        </button>

        <button
          type="submit"
          id="submit-loan-app-btn"
          disabled={isSubmitting}
          className="w-2/3 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isSubmitting ? (
            <RotateCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{t(language, 'submitApplication')}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </>
          )}
        </button>
      </div>
      </form>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">{t(language, 'termsAndConditionsTitle') || 'Terms & Conditions'}</h2>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 opacity-0 hidden" />
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto text-sm text-slate-600 space-y-4">
              <p>Please read and accept the following terms and conditions to proceed with your loan application.</p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl h-48 overflow-y-auto text-xs space-y-3 shadow-inner">
                <p>1. By submitting this application, you declare that all provided information is accurate and truthful.</p>
                <p>2. You authorize the funding entity to perform background and credit history checks.</p>
                <p>3. You agree to the proposed repayment schedule, which includes processing fees and interest rates as specified in the estimate.</p>
                <p>4. In the event of default, you agree that your employer may be contacted, and late fees may be applied.</p>
                <p>5. Your digital signature carries the same legal weight as a physical signature under applicable laws.</p>
                <p>6. All documents uploaded are certified as true copies of the originals.</p>
                <p>7. You understand that this application is subject to final approval by the credit committee.</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                {t(language, 'decline') || 'Decline'}
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
              >
                {t(language, 'acceptAndSubmit') || 'Accept & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
