import React, { useState } from 'react';
import { UserCheck, Users, ArrowRight, ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { Language, GuarantorDetails } from '../types';
import { GUARANTOR_RELATIONSHIPS } from '../config/appConfig';
import { t } from '../i18n/translations';

interface Step7GuarantorProps {
  language: Language;
  initialData?: Partial<GuarantorDetails>;
  onSaveAndNext: (data: GuarantorDetails) => void;
  onBack: () => void;
}

export const Step7Guarantor: React.FC<Step7GuarantorProps> = ({
  language,
  initialData,
  onSaveAndNext,
  onBack,
}) => {
  const [hasGuarantor, setHasGuarantor] = useState<boolean>(
    initialData?.hasGuarantor ?? false
  );
  const [formData, setFormData] = useState<GuarantorDetails>({
    hasGuarantor: initialData?.hasGuarantor ?? false,
    fullName: initialData?.fullName || '',
    passportOrIdNumber: initialData?.passportOrIdNumber || '',
    mobilePhoneNumber: initialData?.mobilePhoneNumber || '',
    relationship: initialData?.relationship || 'Co-worker',
    otherRelationshipDetails: initialData?.otherRelationshipDetails || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    if (!hasGuarantor) return true;
    const errs: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      errs.fullName = t(language, 'requiredField');
    }
    if (!formData.passportOrIdNumber?.trim()) {
      errs.passportOrIdNumber = t(language, 'requiredField');
    }
    if (!formData.mobilePhoneNumber?.trim()) {
      errs.mobilePhoneNumber = t(language, 'requiredField');
    }
    if (formData.relationship === 'Other' && (!formData.otherRelationshipDetails || !formData.otherRelationshipDetails.trim())) {
      errs.otherRelationshipDetails = 'Please provide details for the relationship';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasGuarantor) {
      onSaveAndNext({
        hasGuarantor: false,
        fullName: '',
        passportOrIdNumber: '',
        mobilePhoneNumber: '',
        relationship: 'None' as any,
      });
      return;
    }

    if (validate()) {
      onSaveAndNext({
        ...formData,
        hasGuarantor: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 mb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t(language, 'guarantorTitle')}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t(language, 'guarantorSubtitle')}
        </p>
      </div>

      <div className="space-y-5 mb-8">
        {/* Guarantor Choice Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {t(language, 'hasGuarantorQuestion')}
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setHasGuarantor(false);
                setErrors({});
              }}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                !hasGuarantor
                  ? 'border-blue-900 bg-blue-50/50 ring-2 ring-blue-900/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                !hasGuarantor ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-300'
              }`}>
                {!hasGuarantor && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {t(language, 'noGuarantor')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t(language, 'guarantorOptionalNotice')}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHasGuarantor(true)}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                hasGuarantor
                  ? 'border-blue-900 bg-blue-50/50 ring-2 ring-blue-900/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                hasGuarantor ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-300'
              }`}>
                {hasGuarantor && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {t(language, 'yesGuarantor')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t(language, 'guarantorUploadNotice')}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Guarantor Details Form (Only when hasGuarantor is true) */}
        {hasGuarantor && (
          <div className="space-y-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-xs font-bold text-blue-900">
                Guarantor Information
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ID Upload Required Next
              </span>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t(language, 'guarantorNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                id="guarantor-fullname-input"
                type="text"
                required
                placeholder="Full legal name"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-blue-900 focus:outline-none"
              />
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
            </div>

            {/* Passport / ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t(language, 'guarantorIdLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                id="guarantor-passport-input"
                type="text"
                required
                placeholder="Passport or Israeli ID number"
                value={formData.passportOrIdNumber || ''}
                onChange={(e) => setFormData({ ...formData, passportOrIdNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono focus:border-blue-900 focus:outline-none"
              />
              {errors.passportOrIdNumber && <p className="text-xs text-red-600">{errors.passportOrIdNumber}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t(language, 'guarantorPhoneLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                id="guarantor-phone-input"
                type="tel"
                required
                placeholder="+972-5X-XXXXXXX"
                value={formData.mobilePhoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, mobilePhoneNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-blue-900 focus:outline-none"
              />
              {errors.mobilePhoneNumber && <p className="text-xs text-red-600">{errors.mobilePhoneNumber}</p>}
            </div>

            {/* Relationship */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t(language, 'guarantorRelationshipLabel')}
              </label>
              <select
                id="guarantor-rel-select"
                value={formData.relationship || 'Co-worker'}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-blue-900 focus:outline-none cursor-pointer"
              >
                {GUARANTOR_RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Other Relationship Details */}
            {formData.relationship === 'Other' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                <label htmlFor="other-relationship-input" className="block text-xs font-bold text-slate-700">
                  {t(language, 'pleaseSpecify')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="other-relationship-input"
                  type="text"
                  required
                  placeholder={t(language, 'provideDetails')}
                  value={formData.otherRelationshipDetails || ''}
                  onChange={(e) => setFormData({ ...formData, otherRelationshipDetails: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    errors.otherRelationshipDetails
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'
                  }`}
                />
                {errors.otherRelationshipDetails && <p className="text-xs text-red-600">{errors.otherRelationshipDetails}</p>}
              </div>
            )}
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
          id="step7-continue-btn"
          className="w-2/3 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t(language, 'continue')}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </button>
      </div>
    </form>
  );
};
