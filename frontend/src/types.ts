export type Language = 'en' | 'he' | 'th' | 'zh' | 'tl';

export type CanonicalStatus =
  | 'Received'
  | 'Under Review'
  | 'Additional Document Required'
  | 'Approved'
  | 'Rejected'
  | 'Forwarded to Funding Entity';

export type UserRole =
  | 'borrower'
  | 'customer_service'
  | 'credit_reviewer'
  | 'system_admin'
  | 'funding_entity';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Other';

export type SalaryPaymentMethod = 'Bank transfer' | 'Cash' | 'Check' | 'Other';

export type LoanPurpose = 'Cash flow' | 'Equipment' | 'Investment' | 'Other';

export type RepaymentSource =
  | 'Bank transfer'
  | 'Salary deduction'
  | 'Cash'
  | 'Digital wallet'
  | 'Credit card';

export type GuarantorRelationship =
  | 'Employer'
  | 'Family member'
  | 'Friend'
  | 'Co-worker'
  | 'Relative'
  | 'Community member'
  | 'Other';

export type DocumentTypeCode =
  | 'PASSPORT'
  | 'WORK_VISA'
  | 'PAY_SLIP'
  | 'EMPLOYMENT_CONFIRMATION'
  | 'BANK_STATEMENT'
  | 'EMPLOYER_GUARANTEE'
  | 'CREDIT_CARD';

export interface DocumentTypeInfo {
  code: DocumentTypeCode;
  id: string;
  name: string;
  isRequired: boolean;
  allowsMultiple: boolean;
  titleKey: string;
  descKey: string;
}

export interface UploadedFile {
  id: string;
  applicationId: string;
  documentTypeCode: DocumentTypeCode;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  storageKey: string;
  dataUrl?: string;
  uploadSource: 'camera' | 'gallery' | 'file';
  qualityStatus: 'pending' | 'passed' | 'failed' | 'warning' | 'not_checked';
  qualityIssues?: string[];
  ocrStatus: 'pending' | 'completed' | 'failed' | 'not_requested';
  ocrExtractedData?: {
    passportNumber?: string;
    fullName?: string;
    nationality?: string;
    visaCategory?: string;
    visaExpiryDate?: string;
    maskedPan?: string;
    cardholder?: string;
    confidence?: number;
  };
  userConfirmed: boolean;
  maskedCardNumber?: string;
  uploadedAt: string;
}

export interface BorrowerDetails {
  fullName: string;
  passportNumber: string;
  countryOfOrigin: string;
  dateOfBirth: string; // YYYY-MM-DD
  mobilePhoneNumber: string;
  addressCity: string;
  addressStreet: string;
  addressFull: string;
  maritalStatus: MaritalStatus;
}

export interface ResidencyDetails {
  visaType: string;
  visaExpiryDate: string; // YYYY-MM-DD
  dateOfEntry: string; // YYYY-MM-DD
  yearsOfResidency: number; // Derived automatically
}

export interface EmploymentDetails {
  employerName: string;
  staffingAgencyName?: string;
  jobTenureMonths: number;
  monthlySalaryNis: number;
  salaryPaymentMethod: SalaryPaymentMethod;
}

export interface LoanRequest {
  requestedAmountNis: number;
  loanPurpose: LoanPurpose;
  otherPurposeDetails?: string;
  repaymentPeriodMonths: number;
  repaymentSource: RepaymentSource;
  estimatedMonthlyPaymentNis: number;
  totalRepaymentNis: number;
}

export type LoanRequestDetails = LoanRequest;

export interface GuarantorDetails {
  hasGuarantor: boolean;
  fullName?: string;
  passportOrIdNumber?: string;
  mobilePhoneNumber?: string;
  relationship?: GuarantorRelationship | string;
  passportPhoto?: UploadedFile;
}

export interface ConsentRecord {
  id: string;
  applicationId: string;
  consentType: 'terms_and_conditions' | 'credit_check';
  consentVersion: string;
  consentGiven: boolean;
  consentTextHash?: string;
  ipAddress?: string;
  deviceMetadata?: string;
  givenAt: string;
}

export interface DigitalSignature {
  id: string;
  applicationId: string;
  signatureMethod: 'typed_name' | 'drawn_signature' | 'drawn_touch';
  signatureValue?: string;
  signatureDataUri?: string;
  signedAt: string;
  ipAddress?: string;
  deviceMetadata?: string;
}

export interface StatusHistoryItem {
  id: string;
  applicationId: string;
  fromStatus?: CanonicalStatus | null;
  toStatus: CanonicalStatus;
  changedByType: 'borrower' | 'customer_service' | 'credit_reviewer' | 'system_admin' | 'funding_entity' | 'system';
  changedById?: string;
  changedByName?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  applicationId?: string;
  channel: 'sms' | 'push';
  notificationType: string;
  language: Language;
  title: string;
  message: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  providerMessageId?: string;
  attemptedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  read?: boolean;
}

export interface AuditEvent {
  id: string;
  actorType: string;
  actorId?: string;
  actorName?: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  deviceMetadata?: string;
  createdAt: string;
}

export interface OTPCode {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  consumedAt?: string;
  createdAt: string;
}

export interface ApplicationConfig {
  minLoanAmountNis: number;
  maxLoanAmountNis: number;
  amountIncrementNis: number;
  allowedRepaymentPeriodsMonths: number[];
  eligibleRepaymentSources: RepaymentSource[];
  defaultInterestRatePercent: number;
  processingFeePercent: number;
  managementFeeNis: number;
  otpExpirationSeconds: number;
  maxFileSizeBytes: number;
  minBorrowerAge: number;
  minVisaValidityMonths: number;
}

export interface LoanApplication {
  id: string;
  userId: string;
  requestNumber: string;
  isSubmitted: boolean;
  submittedAt?: string;
  status: CanonicalStatus;
  language: Language;
  currentStep: number; // 1 to 11
  borrowerDetails?: BorrowerDetails;
  residencyDetails?: ResidencyDetails;
  employmentDetails?: EmploymentDetails;
  loanRequest?: LoanRequest;
  guarantor?: GuarantorDetails;
  documents: UploadedFile[];
  consents: ConsentRecord[];
  digitalSignature?: DigitalSignature;
  statusHistory: StatusHistoryItem[];
  missingDocumentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName?: string;
  email?: string;
  password?: string;
  authProvider?: 'phone' | 'google' | 'password';
  phoneVerifiedAt?: string;
  preferredLanguage: Language;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FundingIntegrationRecord {
  id: string;
  applicationId: string;
  providerCode: string;
  operation: 'submit_application' | 'send_document' | 'status_update';
  externalReference?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  attemptCount: number;
  requestMetadata?: Record<string, unknown>;
  responseMetadata?: Record<string, unknown>;
  errorMessage?: string;
  lastAttemptAt?: string;
  completedAt?: string;
  createdAt: string;
}
