import React, { useState } from 'react';
import {
  HelpCircle,
  Globe,
  Shield,
  ChevronDown,
  Check,
  Wifi,
  WifiOff,
  Briefcase,
  UserCheck,
  User as UserIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Language, User, UserRole } from '../types';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onSignOut: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isBackOfficeOpen: boolean;
  onToggleBackOffice: () => void;
  onOpenHelp: () => void;
  isOnline: boolean;
  draftSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentUser,
  onSignOut,
  currentRole,
  onRoleChange,
  isBackOfficeOpen,
  onToggleBackOffice,
  onOpenHelp,
  isOnline,
  draftSaved,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[1];

  const roles: { role: UserRole; label: string; badgeColor: string }[] = [
    { role: 'borrower', label: 'Borrower', badgeColor: 'bg-blue-100 text-blue-800' },
    { role: 'customer_service', label: 'Customer Service', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { role: 'credit_reviewer', label: 'Credit Reviewer', badgeColor: 'bg-purple-100 text-purple-800' },
    { role: 'system_admin', label: 'System Admin', badgeColor: 'bg-amber-100 text-amber-800' },
    { role: 'funding_entity', label: 'Funding Entity', badgeColor: 'bg-indigo-100 text-indigo-800' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Language Selector & Online status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              id="header-lang-picker-btn"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full flex items-center gap-1 transition-colors"
              title="Change Language"
              aria-label="Language selector"
            >
              <Globe className="w-5 h-5 text-slate-600 hover:text-blue-600" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  {t(currentLanguage, 'chooseLanguageTitle')}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-blue-50/70 font-bold text-blue-900'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </div>
                    </div>
                    {currentLanguage === lang.code && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            id="header-help-btn"
            onClick={onOpenHelp}
            aria-label="Help and FAQ"
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="Help & FAQ"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {!isOnline ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          ) : draftSaved ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium animate-fade-in">
              <Check className="w-3 h-3" />
              Saved
            </span>
          ) : null}
        </div>

        {/* Center: Brand Logo "LendGlobal" */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() =>
            !isBackOfficeOpen && window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-sm tracking-tight font-extrabold">LG</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-extrabold tracking-tight text-blue-600 leading-none">
              LendGlobal
            </span>
          </div>
        </div>

        {/* Right: Back Office Toggle & User Account Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Back office portal toggle */}
          <button
            id="portal-toggle-btn"
            onClick={onToggleBackOffice}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
              isBackOfficeOpen
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Admin Back Office"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isBackOfficeOpen
                ? t(currentLanguage, 'borrowerView')
                : t(currentLanguage, 'backOffice')}
            </span>
          </button>

          {/* User Profile / Account Menu */}
          <div className="relative">
            <button
              id="header-user-menu-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1.5 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors flex items-center"
              title="User Account"
              aria-label="User Account"
            >
              {currentUser ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.fullName
                    ? currentUser.fullName.charAt(0)
                    : currentUser.phoneNumber.slice(-2)}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-slate-500" />
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-sm text-slate-900">
                        {currentUser.fullName || 'Registered Borrower'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {currentUser.phoneNumber}
                      </div>
                      {currentUser.email && (
                        <div className="text-xs text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onToggleBackOffice();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <span>Open Admin Back Office</span>
                      </button>

                      <button
                        type="button"
                        id="user-signout-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-3 space-y-2 text-center">
                    <p className="text-xs text-slate-500">Not signed in yet</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
