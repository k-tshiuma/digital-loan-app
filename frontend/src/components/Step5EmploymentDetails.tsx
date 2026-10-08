import React, { useState, useEffect } from 'react';
import { Building2, Briefcase, DollarSign, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Language, EmploymentDetails } from '../types';
import { SALARY_PAYMENT_METHODS } from '../config/appConfig';
import { t } from '../i18n/translations';

interface Step5EmploymentDetailsProps {
  language: Language;
  initialData?: Partial<EmploymentDetails>;
  onSaveAndNext: (data: EmploymentDetails) => void;
  onBack: () => void;
}

export const Step5EmploymentDetails: React.FC<Step5EmploymentDetailsProps> = ({
  language,
  initialData,
  onSaveAndNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<EmploymentDetails>({
    employerName: initialData?.employerName || '',
    staffingAgencyName: initialData?.staffingAgencyName || '',
    jobTenureMonths: initialData?.jobTenureMonths || 18,
    monthlySalaryNis: initialData?.monthlySalaryNis || 7500,
    salaryPaymentMethod: initialData?.salaryPaymentMethod || 'Bank Transfer',
  });

  // Sync formData whenever initialData updates
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        employerName: initialData.employerName ?? prev.employerName,
        staffingAgencyName: initialData.staffingAgencyName ?? prev.staffingAgencyName,
        jobTenureMonths: initialData.jobTenureMonths ?? prev.jobTenureMonths,
        monthlySalaryNis: initialData.monthlySalaryNis ?? prev.monthlySalaryNis,
        salaryPaymentMethod: initialData.salaryPaymentMethod ?? prev.salaryPaymentMethod,
      }));
    }
  }, [initialData]);

  const isPreFilled = Boolean(initialData && initialData.employerName);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.employerName.trim()) {
      errs.employerName = t(language, 'requiredField');
    }

    if (!formData.jobTenureMonths || formData.jobTenureMonths <= 0) {
      errs.jobTenureMonths = t(language, 'requiredField');
    }

    if (!formData.monthlySalaryNis || formData.monthlySalaryNis < 1000) {
      errs.monthlySalaryNis = 'Please enter a valid monthly salary in NIS (minimum ₪1,000)';
    }

    if (formData.salaryPaymentMethod === 'Other' && (!formData.otherSalaryPaymentMethodDetails || !formData.otherSalaryPaymentMethodDetails.trim())) {
      errs.otherSalaryPaymentMethodDetails = 'Please provide details for the other payment method';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSaveAndNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 mb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t(language, 'employmentDetailsTitle')}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t(language, 'employmentDetailsSubtitle')}
        </p>
      </div>

      {/* On-File Profile Banner */}
      {isPreFilled && (
        <div className="p-3 mb-4 rounded-2xl bg-blue-50 border border-blue-200/90 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <span className="font-bold text-blue-950 block">Employment details on file</span>
              <span className="text-[11px] text-blue-800">Pre-filled from your profile. You can update employer, tenure, or monthly salary below.</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
            On File
          </span>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {/* Employer Name */}
        <div className="space-y-1.5">
          <label htmlFor="employer-name-input" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'employerNameLabel')} <span className="text-red-500">*</span>
          </label>
          <input
            id="employer-name-input"
            type="text"
            required
            placeholder="e.g. Moshav Farm / Care Service / Construction Ltd."
            value={formData.employerName}
            onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
              errors.employerName
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'
            }`}
          />
          {errors.employerName && <p className="text-xs text-red-600">{errors.employerName}</p>}
        </div>

        {/* Staffing Agency */}
        <div className="space-y-1.5">
          <label htmlFor="agency-name-input" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'staffingAgencyLabel')}
          </label>
          <input
            id="agency-name-input"
            type="text"
            placeholder="e.g. Manpower Israel / Matan Care (Optional)"
            value={formData.staffingAgencyName}
            onChange={(e) => setFormData({ ...formData, staffingAgencyName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none transition-all"
          />
        </div>

        {/* Job Tenure */}
        <div className="space-y-1.5">
          <label htmlFor="tenure-input" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'jobTenureMonthsLabel')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="tenure-input"
              type="number"
              min={1}
              max={240}
              required
              value={formData.jobTenureMonths}
              onChange={(e) => setFormData({ ...formData, jobTenureMonths: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none transition-all"
            />
            <span className="absolute right-4 top-3 text-xs text-slate-400 font-semibold uppercase">
              months
            </span>
          </div>
          {errors.jobTenureMonths && <p className="text-xs text-red-600">{errors.jobTenureMonths}</p>}
        </div>

        {/* Monthly Salary in NIS ₪ */}
        <div className="space-y-1.5">
          <label htmlFor="salary-input" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'monthlySalaryLabel')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-3 text-base font-bold text-blue-900 pointer-events-none">
              ₪
            </div>
            <input
              id="salary-input"
              type="number"
              step={100}
              min={1000}
              max={50000}
              required
              value={formData.monthlySalaryNis}
              onChange={(e) => setFormData({ ...formData, monthlySalaryNis: parseInt(e.target.value) || 0 })}
              className={`w-full pl-9 pr-12 py-3 rounded-xl border bg-white text-slate-900 text-base font-bold font-mono focus:outline-none focus:ring-2 transition-all ${
                errors.monthlySalaryNis
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'
              }`}
            />
            <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold uppercase">
              NIS
            </span>
          </div>
          {errors.monthlySalaryNis && <p className="text-xs text-red-600">{errors.monthlySalaryNis}</p>}
        </div>

        {/* Salary Payment Method */}
        <div className="space-y-1.5">
          <label htmlFor="payment-method-select" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'salaryPaymentMethodLabel')}
          </label>
          <select
            id="payment-method-select"
            value={formData.salaryPaymentMethod}
            onChange={(e) => setFormData({ ...formData, salaryPaymentMethod: e.target.value as any })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none transition-all cursor-pointer"
          >
            {SALARY_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Other Salary Payment Method Details */}
        {formData.salaryPaymentMethod === 'Other' && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
            <label htmlFor="other-payment-method-input" className="block text-xs font-bold text-slate-700 ">
              {t(language, 'pleaseSpecify')} <span className="text-red-500">*</span>
            </label>
            <input
              id="other-payment-method-input"
              type="text"
              required
              placeholder={t(language, 'provideDetails')}
              value={formData.otherSalaryPaymentMethodDetails || ''}
              onChange={(e) => setFormData({ ...formData, otherSalaryPaymentMethodDetails: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.otherSalaryPaymentMethodDetails
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'
              }`}
            />
            {errors.otherSalaryPaymentMethodDetails && <p className="text-xs text-red-600">{errors.otherSalaryPaymentMethodDetails}</p>}
          </div>
        )}
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
          id="step5-continue-btn"
          className="w-2/3 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t(language, 'continue')}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </button>
      </div>
    </form>
  );
};
