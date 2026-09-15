import React from 'react';
import { X, HelpCircle, Phone, MessageSquare, ShieldCheck, FileText, Clock, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { t } from '../i18n/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Who is eligible to apply for a QuickLoan in Israel?',
      q_he: 'מי זכאי להגיש בקשה להלוואה?',
      q_th: 'ใครมีสิทธิ์ยื่นขอสินเชื่อในอิสราเอลได้บ้าง?',
      q_zh: '在以色列哪些人符合贷款申请资格？',
      q_tl: 'Sino ang kuwalipikadong mag-apply ng pautang sa Israel?',
      a: 'Foreign workers legally employed in Israel with a valid B-1 work visa (Agriculture, Caregiving, Construction, etc.) who are at least 21 years old and have at least 6 months of visa validity remaining.',
    },
    {
      q: 'What is the maximum loan amount and repayment period?',
      q_he: 'מהו סכום ההלוואה המרבי ותקופת ההחזר?',
      q_th: 'วงเงินกู้สูงสุดและระยะเวลาผ่อนชำระคือเท่าใด?',
      q_zh: '最高可申请多少借款额度？最长还款期限是多久？',
      q_tl: 'Magkano ang pinakamataas na halaga ng loan at panahon ng pagbabayad?',
      a: 'Loans range from ₪500 up to ₪10,000 with flexible repayment periods of 3, 6, 9, or 12 months. All estimates and fees are transparently displayed in Israeli Shekels.',
    },
    {
      q: 'Which documents do I need to prepare?',
      q_he: 'אילו מסמכים עליי להכין מראש?',
      q_th: 'เอกสารที่ต้องเตรียมมีอะไรบ้าง?',
      q_zh: '我需要提前准备哪些证明材料？',
      q_tl: 'Anong mga dokumento ang kailangang ihanda?',
      a: '1) Passport photo page, 2) Valid Israeli work visa sticker, 3) Last 3 salary pay slips, 4) Employment confirmation letter, 5) Recent 3 months bank statements.',
    },
    {
      q: 'Is my data secure and private?',
      q_he: 'האם המידע שלי מאובטח ומוגן?',
      q_th: 'ข้อมูลส่วนตัวของฉันปลอดภัยหรือไม่?',
      q_zh: '我的个人隐私及数据安全吗？',
      q_tl: 'Ligtas at protektado ba ang aking mga datos?',
      a: 'Yes. QuickLoan uses bank-grade encryption in transit (TLS 1.3) and at rest. Credit card numbers are masked, and immutable audit logs record every access.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t(language, 'helpFaq')}</h3>
              <p className="text-xs text-slate-500">{t(language, 'appTagline')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
          {/* Quick Support Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs text-blue-950">Helpline / WhatsApp</div>
                <div className="text-xs text-blue-700 font-mono mt-0.5">*3450 / +972-3-5551234</div>
                <div className="text-[10px] text-blue-500">Sun - Thu: 08:30 - 18:00</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs text-emerald-950">Multi-Language Chat</div>
                <div className="text-xs text-emerald-700 mt-0.5">HE / EN / TH / ZH / TL</div>
                <div className="text-[10px] text-emerald-600">Response within 15 min</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-xs text-slate-400 mb-3">
              Frequently Asked Questions
            </h4>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="font-semibold text-slate-900 text-xs flex items-start gap-2">
                    <span className="text-blue-600 font-bold">Q:</span>
                    <span>{faq.q}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed ps-4">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Guarantee */}
          <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Licensed & Regulated</span> under Israeli Financial Service Provider standards.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            {t(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
