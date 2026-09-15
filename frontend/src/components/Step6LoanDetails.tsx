import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, ArrowRight, ArrowLeft, Coins, Calendar, Sparkles } from 'lucide-react';
import { Language, LoanRequest } from '../types';
import {
  LOAN_PERIOD_OPTIONS,
  LOAN_PURPOSE_OPTIONS,
  REPAYMENT_SOURCE_OPTIONS,
  GRACE_PERIOD_OPTIONS,
  calculateLoanRepayment,
} from '../config/appConfig';
import { t } from '../i18n/translations';

interface Step6LoanDetailsProps {
  language: Language;
  initialData?: Partial<LoanRequest>;
  onSaveAndNext: (data: LoanRequest) => void;
  onBack: () => void;
}

export const Step6LoanDetails: React.FC<Step6LoanDetailsProps> = ({
  language,
  initialData,
  onSaveAndNext,
  onBack,
}) => {
  const [requestedAmount, setRequestedAmount] = useState<number>(
    initialData?.requestedAmountNis || 5000
  );
  const [repaymentMonths, setRepaymentMonths] = useState<number>(
    initialData?.repaymentPeriodMonths || 6
  );
  const [loanPurpose, setLoanPurpose] = useState<string>(
    initialData?.loanPurpose || 'Cash Flow'
  );
  const [otherPurposeDetails, setOtherPurposeDetails] = useState<string>(
    initialData?.otherPurposeDetails || ''
  );
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(
    initialData?.gracePeriodMonths || 0
  );
  const [repaymentSource, setRepaymentSource] = useState<string>(
    initialData?.repaymentSource || 'Bank transfer'
  );

  const [calculation, setCalculation] = useState(() =>
    calculateLoanRepayment(requestedAmount, repaymentMonths)
  );

  // Live repayment recalculation
  useEffect(() => {
    const calc = calculateLoanRepayment(requestedAmount, repaymentMonths);
    setCalculation(calc);
  }, [requestedAmount, repaymentMonths]);

  const handleAmountSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestedAmount(Number(e.target.value));
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setRequestedAmount(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAndNext({
      requestedAmountNis: requestedAmount,
      loanPurpose: loanPurpose as any,
      otherPurposeDetails: loanPurpose === 'Other' ? otherPurposeDetails : undefined,
      repaymentPeriodMonths: repaymentMonths as any,
      gracePeriodMonths: gracePeriodMonths,
      repaymentSource: repaymentSource as any,
      estimatedMonthlyPaymentNis: calculation.monthlyPaymentNis,
      totalRepaymentNis: calculation.totalRepaymentNis,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 mb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t(language, 'loanDetailsTitle')}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t(language, 'loanDetailsSubtitle')}
        </p>
      </div>

      <div className="space-y-5 mb-6">
        {/* Loan Amount Slider & Input */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 ">
              {t(language, 'loanAmountLabel')}
            </label>
            <span className="text-[11px] text-slate-400 font-semibold">
              Min ₪500 — Max ₪10,000
            </span>
          </div>

          <div className="flex items-center justify-center py-1">
            <span className="text-3xl font-extrabold text-blue-900 font-mono tracking-tight">
              ₪{requestedAmount.toLocaleString()}
            </span>
          </div>

          {/* Range Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={requestedAmount}
              onChange={handleAmountSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono font-medium px-1">
              <span>₪500</span>
              <span>₪5,000</span>
              <span>₪10,000</span>
            </div>
          </div>
        </div>

        {/* Repayment Period in Months */}
        <div className="space-y-1.5">
          <label htmlFor="period-select" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'repaymentPeriodLabel')} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {LOAN_PERIOD_OPTIONS.map((opt) => {
              const isSelected = repaymentMonths === opt.months;
              return (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setRepaymentMonths(opt.months)}
                  className={`py-3 px-2 rounded-xl text-center border font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grace Period */}
        <div className="space-y-1.5">
          <label htmlFor="grace-period-select" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'gracePeriodLabel')} <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            {t(language, 'gracePeriodHint')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {GRACE_PERIOD_OPTIONS.map((months) => {
              const isSelected = gracePeriodMonths === months;
              return (
                <button
                  key={months}
                  type="button"
                  onClick={() => setGracePeriodMonths(months)}
                  className={`py-3 px-2 rounded-xl text-center border font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {months === 0 ? 'None' : `${months} Mos`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loan Purpose */}
        <div className="space-y-1.5">
          <label htmlFor="purpose-select" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'loanPurposeLabel')} <span className="text-red-500">*</span>
          </label>
          <select
            id="purpose-select"
            value={loanPurpose}
            onChange={(e) => setLoanPurpose(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none cursor-pointer"
          >
            {LOAN_PURPOSE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {loanPurpose === 'Other' && (
            <input
              type="text"
              required
              placeholder={t(language, 'otherPurposePlaceholder')}
              value={otherPurposeDetails}
              onChange={(e) => setOtherPurposeDetails(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-blue-900 focus:outline-none"
            />
          )}
        </div>

        {/* Repayment Source */}
        <div className="space-y-1.5">
          <label htmlFor="repayment-source-select" className="block text-xs font-bold text-slate-700 ">
            {t(language, 'repaymentSourceLabel')} <span className="text-red-500">*</span>
          </label>
          <select
            id="repayment-source-select"
            value={repaymentSource}
            onChange={(e) => setRepaymentSource(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none cursor-pointer"
          >
            {REPAYMENT_SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Live Calculation / Transparent Repayment Breakdown Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-blue-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold text-blue-200">
                {t(language, 'estimatedRepaymentTitle')}
              </span>
            </div>
            <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full font-medium">
              {repaymentMonths} months plan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="text-[11px] text-blue-300 font-medium">
                {t(language, 'estimatedMonthlyRepayment')}
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                ₪{calculation.monthlyPaymentNis.toLocaleString()}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-blue-300 font-medium">
                {t(language, 'totalRepayment')}
              </div>
              <div className="text-2xl font-extrabold font-mono text-blue-100 mt-0.5">
                ₪{calculation.totalRepaymentNis.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-blue-300/80 border-t border-blue-800/60 pt-2 flex items-center justify-between">
            <span>Interest & Processing Fee ({calculation.interestRatePercent}% APR + ₪{calculation.managementFeeNis})</span>
            <span className="font-mono text-white font-semibold">₪{calculation.totalInterestNis + calculation.managementFeeNis}</span>
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
          id="step6-continue-btn"
          className="w-2/3 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t(language, 'continue')}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </button>
      </div>
    </form>
  );
};
