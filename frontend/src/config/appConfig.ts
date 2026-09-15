import { ApplicationConfig, DocumentTypeInfo, CanonicalStatus } from '../types';

export const DEFAULT_APP_CONFIG: ApplicationConfig = {
  minLoanAmountNis: 500,
  maxLoanAmountNis: 10000,
  amountIncrementNis: 500,
  allowedRepaymentPeriodsMonths: [3, 6, 9, 12],
  eligibleRepaymentSources: [
    'Bank transfer',
    'Salary deduction',
    'Cash',
    'Digital wallet',
    'Credit card',
  ],
  defaultInterestRatePercent: 8.5, // 8.5% default APR
  processingFeePercent: 1.0,
  managementFeeNis: 80,
  otpExpirationSeconds: 300,
  maxFileSizeBytes: 10 * 1024 * 1024,
  minBorrowerAge: 21,
  minVisaValidityMonths: 6,
};

export const ORIGIN_COUNTRIES = [
  'Thailand',
  'Philippines',
  'China',
  'India',
  'Nepal',
  'Vietnam',
  'Sri Lanka',
  'Moldova',
  'Ukraine',
  'Romania',
  'Other',
];

export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Other'];

export const SALARY_PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Check', 'Other'];

export const LOAN_PURPOSE_OPTIONS = ['Cash Flow', 'Equipment', 'Investment', 'Other'];

export const REPAYMENT_SOURCE_OPTIONS = [
  'Bank Transfer',
  'Salary Deduction',
  'Cash',
  'Digital Wallet',
  'Credit Card',
];

export const GUARANTOR_RELATIONSHIPS = [
  'Co-worker',
  'Friend',
  'Relative',
  'Family Member',
  'Employer',
  'Community Member',
  'Other',
];

export const LOAN_PERIOD_OPTIONS = [
  { months: 3, label: '3 Mos' },
  { months: 6, label: '6 Mos' },
  { months: 9, label: '9 Mos' },
  { months: 12, label: '12 Mos' },
];

export const GRACE_PERIOD_OPTIONS = [0, 1, 2, 3];

export const VISA_TYPES = [
  { code: 'b1_agri', id: 'b1_agri', label: 'B-1 Work Visa (Agriculture / חקלאות)' },
  { code: 'b1_care', id: 'b1_care', label: 'B-1 Work Visa (Caregiving / סיעוד)' },
  { code: 'b1_const', id: 'b1_const', label: 'B-1 Work Visa (Construction / בניין)' },
  { code: 'b1_rest', id: 'b1_rest', label: 'B-1 Work Visa (Ethnic Cook / מסעדנות)' },
  { code: 'b1_expert', id: 'b1_expert', label: 'B-1 Work Visa (Foreign Expert / מומחה זר)' },
  { code: 'b1_hotel', id: 'b1_hotel', label: 'B-1 Work Visa (Hotel Services / מלונאות)' },
  { code: 'other_permit', id: 'other_permit', label: 'Other Valid Work Permit / אשרת עבודה אחרת' },
];

export const COUNTRY_PHONE_CODES = [
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
];

export const DOCUMENT_TYPE_CONFIG: DocumentTypeInfo[] = [
  {
    code: 'PASSPORT',
    id: 'doc_passport',
    name: 'Passport Photo Page',
    isRequired: true,
    allowsMultiple: false,
    titleKey: 'docPassportTitle',
    descKey: 'docPassportDesc',
  },
  {
    code: 'PAY_SLIP',
    id: 'doc_pay_slip',
    name: 'Salary Pay Slips',
    isRequired: true,
    allowsMultiple: true,
    titleKey: 'docPaySlipTitle',
    descKey: 'docPaySlipDesc',
  },
  {
    code: 'WORKERS_CARD',
    id: 'doc_workers_card',
    name: "Worker's Card",
    isRequired: false,
    allowsMultiple: false,
    titleKey: 'docWorkersCardTitle',
    descKey: 'docWorkersCardDesc',
  },
];

export const STATUS_BADGE_CONFIG: Record<
  CanonicalStatus,
  { label: string; badgeColor: string; iconName: string }
> = {
  Received: {
    label: 'Received',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    iconName: 'Clock',
  },
  'Under Review': {
    label: 'Under Review',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    iconName: 'FileSearch',
  },
  'Additional Document Required': {
    label: 'Additional Document Required',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse',
    iconName: 'AlertTriangle',
  },
  Approved: {
    label: 'Approved',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconName: 'CheckCircle2',
  },
  Rejected: {
    label: 'Rejected',
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    iconName: 'XCircle',
  },
  'Forwarded to Funding Entity': {
    label: 'Forwarded to Funding Entity',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    iconName: 'Send',
  },
};

/**
 * Calculates live monthly estimated loan repayment.
 */
export function calculateLoanRepayment(
  principalAmount: number,
  periodMonths: number,
  config: ApplicationConfig = DEFAULT_APP_CONFIG
): {
  monthlyPaymentNis: number;
  totalRepaymentNis: number;
  totalInterestNis: number;
  managementFeeNis: number;
  interestRatePercent: number;
} {
  if (principalAmount <= 0 || periodMonths <= 0) {
    return {
      monthlyPaymentNis: 0,
      totalRepaymentNis: 0,
      totalInterestNis: 0,
      managementFeeNis: 0,
      interestRatePercent: config.defaultInterestRatePercent,
    };
  }

  const monthlyRate = config.defaultInterestRatePercent / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, periodMonths);
  const monthlyPrincipalAndInterest = Math.round(
    (principalAmount * (monthlyRate * factor)) / (factor - 1)
  );

  const monthlyFeePortion = Math.round(config.managementFeeNis / periodMonths);
  const monthlyPaymentNis = monthlyPrincipalAndInterest + monthlyFeePortion;
  const totalRepaymentNis = monthlyPaymentNis * periodMonths;
  const totalInterestNis = totalRepaymentNis - principalAmount - config.managementFeeNis;

  return {
    monthlyPaymentNis,
    totalRepaymentNis,
    totalInterestNis,
    managementFeeNis: config.managementFeeNis,
    interestRatePercent: config.defaultInterestRatePercent,
  };
}

/**
 * Calculates exact age from Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculates years of residency from date of entry (YYYY-MM-DD)
 */
export function calculateYearsOfResidency(entryDateString: string): number {
  if (!entryDateString) return 0;
  const entry = new Date(entryDateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - entry.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25;
  return Math.max(0, Math.round(years * 10) / 10);
}

/**
 * Checks if a visa expiry date has expired or expires within 6 months
 */
export function isVisaValidForLoan(
  visaExpiryDateString: string,
  minMonthsRemaining = 6
): { valid: boolean; reason?: string; monthsRemaining?: number } {
  if (!visaExpiryDateString) {
    return { valid: false, reason: 'Visa expiry date is required.' };
  }

  const expiry = new Date(visaExpiryDateString);
  const now = new Date();

  if (isNaN(expiry.getTime())) {
    return { valid: false, reason: 'Invalid date format' };
  }

  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const monthsRemaining = Math.round((diffDays / 30.44) * 10) / 10;

  if (diffDays <= 0) {
    return { valid: false, reason: 'Visa has already expired.', monthsRemaining: 0 };
  }

  if (monthsRemaining < minMonthsRemaining) {
    return {
      valid: false,
      reason: `Visa must have at least ${minMonthsRemaining} months of validity remaining (currently ${monthsRemaining.toFixed(1)} months).`,
      monthsRemaining,
    };
  }

  return { valid: true, monthsRemaining };
}
