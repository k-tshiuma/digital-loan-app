import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft, Calendar, Info } from 'lucide-react';
import { Language, ResidencyDetails } from '../types';
import { VISA_TYPES, calculateYearsOfResidency, isVisaValidForLoan } from '../config/appConfig';
import { t } from '../i18n/translations';

interface Step4ResidencyDetailsProps {
  language: Language;
  initialData?: Partial<ResidencyDetails>;
  onSaveAndNext: (data: ResidencyDetails) => void;
  onBack: () => void;
}

export const Step4ResidencyDetails: React.FC<Step4ResidencyDetailsProps> = ({
  language,
  initialData,
  onSaveAndNext,
  onBack,
}) => {
  // Default entry date ~ 3 years ago, default expiry date ~ 1 year from now
  const defaultEntry = '2023-03-01';
  const defaultExpiry = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<ResidencyDetails>({
    visaType: initialData?.visaType || 'b1_agri',
    visaExpiryDate: initialData?.visaExpiryDate || defaultExpiry,
    dateOfEntry: initialData?.dateOfEntry || defaultEntry,
    yearsOfResidency: initialData?.yearsOfResidency || 3.4,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedYears, setCalculatedYears] = useState<number>(3.4);
  const [visaValidation, setVisaValidation] = useState<{ valid: boolean; reason?: string }>({ valid: true });

  // Update calculated years when date of entry changes
  useEffect(() => {
    if (formData.dateOfEntry) {
      const yrs = calculateYearsOfResidency(formData.dateOfEntry);
      setCalculatedYears(yrs);
      setFormData((prev) => ({ ...prev, yearsOfResidency: yrs }));
    }
  }, [formData.dateOfEntry]);

  // Validate visa expiry
  useEffect(() => {
    if (formData.visaExpiryDate) {
      const res = isVisaValidForLoan(formData.visaExpiryDate, 6);
      setVisaValidation(res);
    }
  }, [formData.visaExpiryDate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.visaExpiryDate) {
      errs.visaExpiryDate = t(language, 'requiredField');
    } else {
      const res = isVisaValidForLoan(formData.visaExpiryDate, 6);
      if (!res.valid) {
        errs.visaExpiryDate = res.reason || t(language, 'visaExpiringSoonWarning');
      }
    }

    if (!formData.dateOfEntry) {
      errs.dateOfEntry = t(language, 'requiredField');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSaveAndNext({
        ...formData,
        yearsOfResidency: calculatedYears,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 mb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t(language, 'residencyDetailsTitle')}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t(language, 'residencyDetailsSubtitle')}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Visa Type Selector */}
        <div className="space-y-1.5">
          <label htmlFor="visa-type-select" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'visaTypeLabel')} <span className="text-red-500">*</span>
          </label>
          <select
            id="visa-type-select"
            value={formData.visaType}
            onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none transition-all cursor-pointer"
          >
            {VISA_TYPES.map((v) => (
              <option key={v.code} value={v.code}>
                {v.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Official visa code from Population and Immigration Authority (PIBA).
          </p>
        </div>

        {/* Visa Expiry Date */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="visa-expiry-input" className="block text-xs font-bold text-slate-700 ">
              {t(language, 'visaExpiryDateLabel')} <span className="text-red-500">*</span>
            </label>
            {visaValidation.valid ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Valid for Loan
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Expiry Warning
              </span>
            )}
          </div>
          <input
            id="visa-expiry-input"
            type="date"
            required
            value={formData.visaExpiryDate}
            onChange={(e) => setFormData({ ...formData, visaExpiryDate: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
              errors.visaExpiryDate || !visaValidation.valid
                ? 'border-amber-400 focus:ring-amber-200'
                : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'
            }`}
          />
          {errors.visaExpiryDate && <p className="text-xs text-red-600">{errors.visaExpiryDate}</p>}
          {!visaValidation.valid && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>{visaValidation.reason || t(language, 'visaExpiringSoonWarning')}</span>
            </div>
          )}
        </div>

        {/* Date of Entry to Israel */}
        <div className="space-y-1.5">
          <label htmlFor="entry-date-input" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'dateOfEntryLabel')} <span className="text-red-500">*</span>
          </label>
          <input
            id="entry-date-input"
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={formData.dateOfEntry}
            onChange={(e) => setFormData({ ...formData, dateOfEntry: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none transition-all"
          />
        </div>

        {/* Derived Years in Israel display card */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900">
                {t(language, 'yearsOfResidencyLabel')}
              </div>
              <div className="text-xs text-slate-500">
                Automatically calculated from entry date
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-blue-950 font-mono">
              {calculatedYears}
            </span>
            <span className="text-xs text-blue-700 font-semibold ml-1">years</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto pt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t(language, 'back')}</span>
        </button>

        <button
          type="submit"
          id="step4-continue-btn"
          className="w-2/3 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t(language, 'continue')}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </button>
      </div>
    </form>
  );
};
