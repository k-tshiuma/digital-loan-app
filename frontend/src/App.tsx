import React, { useState, useEffect } from 'react';
import {
  Language,
  LoanApplication,
  User,
  UserRole,
  BorrowerDetails,
  ResidencyDetails,
  EmploymentDetails,
  LoanRequest,
  GuarantorDetails,
  UploadedFile,
  ConsentRecord,
  DigitalSignature,
  BankAccountDetails,
} from './types';
import { Header } from './components/Header';
import { WizardProgress } from './components/WizardProgress';
import { HelpModal } from './components/HelpModal';
import { ReturningUserConfirmModal } from './components/ReturningUserConfirmModal';
import { Step1Language } from './components/Step1Language';
import { Step2Auth } from './components/Step2Auth';
import { Step3BorrowerDetails } from './components/Step3BorrowerDetails';
import { Step4ResidencyDetails } from './components/Step4ResidencyDetails';
import { Step5EmploymentDetails } from './components/Step5EmploymentDetails';
import { Step6LoanDetails } from './components/Step6LoanDetails';
import { Step7Guarantor } from './components/Step7Guarantor';
import { Step8DocumentUpload } from './components/Step8DocumentUpload';
import { Step9ReviewConfirm } from './components/Step9ReviewConfirm';
import { Step10SubmissionSuccess } from './components/Step10SubmissionSuccess';
import { Step11StatusTimeline } from './components/Step11StatusTimeline';
import { BackOffice } from './components/BackOffice';
import { NotificationDrawer } from './components/NotificationDrawer';
import { MyApplications } from './components/MyApplications';
import { storageService } from './services/storage';
import { apiService } from './services/api';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(() => (storageService.getCurrentUser() ? 3 : 2));
  const [isBackOfficeOpen, setIsBackOfficeOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('borrower');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isMyAppsOpen, setIsMyAppsOpen] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  // Network online/offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update HTML dir and lang attributes when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'he' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  // Load or initialize active application when user is logged in
  useEffect(() => {
    if (currentUser) {
      // 1. Immediately load local draft so UI renders instantaneously
      const localApp = storageService.getOrCreateActiveApplication(currentUser, currentLanguage);
      setApplication(localApp);
      setCurrentLanguage(localApp.language || currentUser.preferredLanguage || 'en');

      if (localApp.isSubmitted) {
        setCurrentStep(11); // Show status dashboard directly if already submitted
      } else if (localApp.currentStep && localApp.currentStep > 1) {
        setCurrentStep(localApp.currentStep);
      } else {
        setCurrentStep(3); // Logged in -> advance to Borrower Details
      }

      // 2. Fetch authoritative active application from backend API to ensure server-persisted
      // personal details and documents are seamlessly synchronized and prefilled immediately
      apiService
        .getActiveApplication(currentUser.id)
        .then((res) => {
          if (res && res.application) {
            const synced = storageService.saveApplication(res.application);
            setApplication({ ...synced });
            if (synced.isSubmitted) {
              setCurrentStep(11);
            } else if (synced.currentStep && synced.currentStep > 1) {
              setCurrentStep(synced.currentStep);
            }
          }
        })
        .catch((err) => {
          console.log('[API] Using local active application draft:', err.message);
        });
    }
  }, [currentUser]);

  // Draft auto-save helper
  const autoSaveDraft = (updatedApp: LoanApplication, nextStep?: number) => {
    if (nextStep) {
      updatedApp.currentStep = nextStep;
    }
    const saved = storageService.saveApplication(updatedApp);
    setApplication({ ...saved });
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
    apiService.saveApplication(saved).catch(() => {});
  };

  // --- Step Navigation Handlers ---

  // Step 1: Language selection
  const handleLanguageSelect = (lang: Language) => {
    setCurrentLanguage(lang);
    if (application) {
      application.language = lang;
      autoSaveDraft(application);
    }
  };

  const handleStep1Next = () => {
    if (currentUser && application) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Authentication
  const handleAuthenticated = (user: User) => {
    setCurrentUser(user);
    const app = storageService.getOrCreateActiveApplication(user, currentLanguage);
    setApplication(app);
    if (app.isSubmitted) {
      setCurrentStep(11);
    } else {
      setCurrentStep(3);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    apiService
      .getActiveApplication(user.id)
      .then((res) => {
        if (res && res.application) {
          const synced = storageService.saveApplication(res.application);
          setApplication({ ...synced });
          if (synced.isSubmitted) {
            setCurrentStep(11);
          }
        }
      })
      .catch(() => {});
  };

  // Step 3: Borrower details
  const handleSaveBorrowerDetails = (borrowerData: BorrowerDetails) => {
    if (!application) return;
    const updated = {
      ...application,
      borrowerDetails: borrowerData,
    };
    autoSaveDraft(updated, 4);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4: Residency details
  const handleSaveResidencyDetails = (residencyData: ResidencyDetails) => {
    if (!application) return;
    const updated = {
      ...application,
      residencyDetails: residencyData,
    };
    autoSaveDraft(updated, 5);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 5: Employment details
  const handleSaveEmploymentDetails = (employmentData: EmploymentDetails) => {
    if (!application) return;
    const updated = {
      ...application,
      employmentDetails: employmentData,
    };
    autoSaveDraft(updated, 6);
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 6: Loan details
  const handleSaveLoanDetails = (loanData: LoanRequest, bankAccount?: BankAccountDetails) => {
    if (!application) return;
    const updated = {
      ...application,
      loanRequest: loanData,
      bankAccount: bankAccount || application.bankAccount,
    };
    autoSaveDraft(updated, 7);
    setCurrentStep(7);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 7: Guarantor details
  const handleSaveGuarantorDetails = (
    guarantorsList: GuarantorItem[],
    legacyGuarantor: GuarantorDetails,
    guarantorDocs: UploadedFile[]
  ) => {
    if (!application) return;
    const existingOtherDocs = (application.documents || []).filter(
      (d) => d.documentTypeCode !== 'GUARANTOR_ID'
    );
    const updated = {
      ...application,
      guarantor: legacyGuarantor,
      guarantors: guarantorsList,
      documents: [...existingOtherDocs, ...guarantorDocs],
    };
    autoSaveDraft(updated, 8);
    setCurrentStep(8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 8: Document uploads
  const handleSaveDocuments = (documentsList: UploadedFile[], bankAccountConfirmed: boolean) => {
    if (!application) return;
    const updated = {
      ...application,
      documents: documentsList,
      bankAccountConfirmed: bankAccountConfirmed,
    };
    autoSaveDraft(updated, 9);
    setCurrentStep(9);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 9: Final Review & Submission
  const handleSubmitApplication = (consents: ConsentRecord[], signature: DigitalSignature) => {
    if (!application) return;
    application.consents = consents;
    application.digitalSignature = signature;
    storageService.saveApplication(application);

    // Call submitApplication to create immutable status and request number
    const submitted = storageService.submitApplication(application.id);
    setApplication({ ...submitted });
    setCurrentStep(10);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync submitted application to backend API
    apiService.saveApplication(submitted).catch((err) => {
      console.warn('Background sync of submitted application to API failed:', err);
    });
  };

  // Step 10 -> Step 11: Advance to status dashboard
  const handleTrackStatus = () => {
    setCurrentStep(11);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset & start new loan application
  const handleStartNewApplication = () => {
    if (!currentUser) return;
    localStorage.removeItem('quickloan_active_app_id');
    const newApp = storageService.getOrCreateActiveApplication(currentUser, currentLanguage);
    setApplication(newApp);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    storageService.logout();
    setCurrentUser(null);
    setApplication(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-900 selection:text-white">
      {/* Top Application Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageSelect}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isBackOfficeOpen={isBackOfficeOpen}
        onToggleBackOffice={() => setIsBackOfficeOpen(!isBackOfficeOpen)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isOnline={isOnline}
        draftSaved={draftSaved}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMyApplications={() => setIsMyAppsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main View Area */}
      {isBackOfficeOpen ? (
        /* Back-Office Portal */
        <BackOffice
          language={currentLanguage}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onCloseBackOffice={() => setIsBackOfficeOpen(false)}
        />
      ) : (
        /* Borrower Mobile-First Flow Container */
        <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-5 w-full">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6 flex flex-col min-h-[580px] transition-all">
            {/* Step Progress indicator (shown for Loan Wizard Steps 3 through 9) */}
            {currentStep >= 3 && currentStep <= 9 && (
              <WizardProgress
                currentStep={currentStep}
                totalSteps={11}
                language={currentLanguage}
              />
            )}

            {/* STEP 1: Language Selection */}
            {currentStep === 1 && (
              <Step1Language
                selectedLanguage={currentLanguage}
                onSelectLanguage={handleLanguageSelect}
                onNext={handleStep1Next}
              />
            )}

            {/* STEP 2: Phone Authentication & OTP */}
            {currentStep === 2 && (
              <Step2Auth
                language={currentLanguage}
                onAuthenticated={handleAuthenticated}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {/* STEP 3: Borrower Details */}
            {currentStep === 3 && (
              <Step3BorrowerDetails
                language={currentLanguage}
                initialData={application?.borrowerDetails}
                userPhoneNumber={currentUser?.phoneNumber}
                applicationId={application?.id}
                onSaveAndNext={handleSaveBorrowerDetails}
                onBack={() => setCurrentStep(currentUser ? 1 : 2)}
              />
            )}

            {/* STEP 4: Residency & Visa Details */}
            {currentStep === 4 && (
              <Step4ResidencyDetails
                language={currentLanguage}
                initialData={application?.residencyDetails}
                onSaveAndNext={handleSaveResidencyDetails}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {/* STEP 5: Employment Details */}
            {currentStep === 5 && (
              <Step5EmploymentDetails
                language={currentLanguage}
                initialData={application?.employmentDetails}
                onSaveAndNext={handleSaveEmploymentDetails}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {/* STEP 6: Loan Request & Live Estimate */}
            {currentStep === 6 && (
              <Step6LoanDetails
                language={currentLanguage}
                initialData={application?.loanRequest}
                initialBankAccount={application?.bankAccount}
                borrowerName={application?.borrowerDetails?.fullName}
                onSaveAndNext={handleSaveLoanDetails}
                onBack={() => setCurrentStep(application?.isReturningUser ? 3 : 5)}
              />
            )}

            {/* STEP 7: Required & Optional Guarantors */}
            {currentStep === 7 && (
              <Step7Guarantor
                language={currentLanguage}
                applicationId={application?.id || 'temp'}
                initialGuarantors={application?.guarantors}
                initialLegacyGuarantor={application?.guarantor}
                fullApplication={application || undefined}
                onSaveAndNext={handleSaveGuarantorDetails}
                onBack={() => setCurrentStep(6)}
              />
            )}

            {/* STEP 8: Document Upload & Quality Check */}
            {currentStep === 8 && (
              <Step8DocumentUpload
                language={currentLanguage}
                applicationId={application?.id || 'temp'}
                initialDocuments={application?.documents}
                initialBankAccountConfirmed={application?.bankAccountConfirmed}
                hasGuarantor={(application?.guarantors?.length || 0) > 0 || !!application?.guarantor?.hasGuarantor}
                guarantors={application?.guarantors}
                fullApplication={application || undefined}
                onSaveAndNext={handleSaveDocuments}
                onBack={() => setCurrentStep(7)}
              />
            )}

            {/* STEP 9: Review & Digital Signature */}
            {currentStep === 9 && application && (
              <Step9ReviewConfirm
                language={currentLanguage}
                application={application}
                onEditStep={(step) => setCurrentStep(step)}
                onSubmit={handleSubmitApplication}
                onBack={() => setCurrentStep(8)}
              />
            )}

            {/* STEP 10: Submission Success & Request Number */}
            {currentStep === 10 && application && (
              <Step10SubmissionSuccess
                language={currentLanguage}
                application={application}
                onTrackStatus={handleTrackStatus}
              />
            )}

            {/* STEP 11: Real-time Status Tracking & Timeline */}
            {currentStep === 11 && application && (
              <Step11StatusTimeline
                language={currentLanguage}
                application={application}
                onApplicationUpdated={(app) => setApplication({ ...app })}
                onStartNewApplication={handleStartNewApplication}
              />
            )}
          </div>

          {/* Secure Trust Footer Note */}
          <div className="mt-4 text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <span className="font-semibold">LendGlobal Israel</span>
            <span>•</span>
            <span>Encrypted via TLS 1.3</span>
            <span>•</span>
            <span className="text-blue-900 font-bold">5 Languages Supported</span>
          </div>
        </main>
      )}

      {/* Multi-language Help & FAQ Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={currentLanguage}
      />

      {/* Real-time Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        userId={currentUser?.id}
        language={currentLanguage}
        onUnreadCountChange={setUnreadNotificationsCount}
      />

      {/* Borrower Application History Modal */}
      {currentUser && (
        <MyApplications
          isOpen={isMyAppsOpen}
          onClose={() => setIsMyAppsOpen(false)}
          currentUser={currentUser}
          language={currentLanguage}
          onSelectApplication={(selected) => {
            storageService.saveApplication(selected);
            localStorage.setItem('quickloan_active_app_id', selected.id);
            setApplication(selected);
            if (selected.isSubmitted) {
              setCurrentStep(11);
            } else if (selected.currentStep) {
              setCurrentStep(selected.currentStep);
            } else {
              setCurrentStep(3);
            }
            setIsBackOfficeOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onStartNewApplication={handleStartNewApplication}
        />
      )}

      {/* Returning User Confirmation Modal (Step 4 of Prompt) */}
      {application?.isReturningUser && !application?.detailsConfirmedAt && !application?.isSubmitted && (
        <ReturningUserConfirmModal
          language={currentLanguage}
          application={application}
          onConfirmEverything={() => {
            const updated = {
              ...application,
              detailsConfirmedAt: new Date().toISOString(),
              currentStep: 6,
            };
            autoSaveDraft(updated, 6);
            setCurrentStep(6);
          }}
          onUpdateDetails={(updatedDetails) => {
            const updated: LoanApplication = {
              ...application,
              borrowerDetails: {
                ...application.borrowerDetails!,
                passportNumber: updatedDetails.passportNumber || application.borrowerDetails?.passportNumber || '',
              },
              employmentDetails: {
                ...application.employmentDetails!,
                employerName: updatedDetails.employerName || application.employmentDetails?.employerName || '',
                monthlySalaryNis: updatedDetails.monthlySalaryNis ?? application.employmentDetails?.monthlySalaryNis ?? 0,
              },
              bankAccount: updatedDetails.bankAccount || application.bankAccount,
              detailsConfirmedAt: new Date().toISOString(),
              currentStep: 6,
            };
            autoSaveDraft(updated, 6);
            setCurrentStep(6);
          }}
          onClose={() => {
            setCurrentStep(3);
          }}
        />
      )}
    </div>
  );
}
