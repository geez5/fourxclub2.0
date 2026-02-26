'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const bgPrimary = '#0a0a0a';
  const bgCard = '#151515';
  const greenColor = '#3D8C3C';
  const purpleColor = '#6B4A9E';
  const textLight = '#ffffff';
  const textMuted = '#888888';
  const borderColor = '#3a3a3a';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgPrimary, color: textLight }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ backgroundColor: `${bgPrimary}ee`, borderBottom: `1px solid ${borderColor}` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <ArrowLeft className="w-5 h-5" style={{ color: greenColor }} />
              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: `2px solid ${greenColor}` }}>
                <img src="/fxclogo.webp" alt="FourXclub Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg" style={{ color: greenColor }}>FourXclub</span>
            </Link>
            <Link href="/privacy" className="text-sm font-medium transition-opacity hover:opacity-80" style={{ color: purpleColor }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${greenColor}10` }} />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${purpleColor}08` }} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-2 mb-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor, border: `1px solid ${greenColor}50` }}>
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: greenColor }}>Terms & Conditions</h1>
          <p className="text-sm" style={{ color: textMuted }}>Last Updated: January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl p-8 md:p-10 space-y-8" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>

              <p className="leading-relaxed" style={{ color: textMuted }}>
                Welcome to FourXclub. These Terms & Conditions (&quot;Terms&quot;) govern your access to and use of our website, courses, live sessions, and community platform. By accessing or using FourXclub, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree, please do not use the platform.
              </p>

              {/* Section 1 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>1</span>
                  Nature of Services
                </h2>
                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                  FourXclub is an educational and awareness-based platform focused on trading concepts, market understanding, and skill development. All content, discussions, sessions, and interactions are provided solely for educational and informational purposes.
                </p>
                <p className="leading-relaxed mb-2 font-medium" style={{ color: textLight }}>FourXclub does not provide:</p>
                <ul className="space-y-1 ml-4">
                  {['Investment advice', 'Financial advice', 'Trading recommendations', 'Portfolio management services', 'Guaranteed strategies or profit assurances'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: greenColor }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>2</span>
                  Market Risk Disclosure
                </h2>
                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                  Trading in financial markets involves substantial risk and may result in partial or complete loss of capital. Market conditions are volatile and unpredictable.
                </p>
                <ul className="space-y-1 ml-4">
                  {['Trading outcomes vary for every individual', 'Past performance is not indicative of future results', 'You may lose more than your initial investment'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: purpleColor }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>3</span>
                  User Responsibility
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  All trading decisions made by you are entirely your own responsibility. FourXclub shall not be held responsible for any trading losses, missed opportunities, or financial outcomes resulting from the use of information shared on the platform. You are encouraged to consult a SEBI-registered financial advisor before making any investment or trading decisions.
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>4</span>
                  Live Trading Sessions Disclaimer
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  Live trading sessions conducted on FourXclub are for educational demonstration purposes only. These sessions are intended to explain market behavior, trade planning, and execution logic. They should not be considered trade signals, buy/sell instructions, or investment advice. Users are strongly advised not to blindly copy trades.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>5</span>
                  One-on-One Interaction Disclaimer
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  Any one-on-one discussions, chats, or interactions with experienced traders or mentors are intended solely for knowledge sharing and educational guidance and do not constitute personalized financial advice.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>6</span>
                  No Guarantee of Results
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  FourXclub makes no guarantees regarding profits, income, trading success, or skill outcomes. Success depends on multiple factors including discipline, risk management, psychology, and market conditions.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>7</span>
                  Community Rules & Conduct
                </h2>
                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                  To maintain a focused and safe learning environment, users agree to:
                </p>
                <ul className="space-y-1 ml-4">
                  {['Avoid spam, promotions, or signal selling', 'Not make false or guaranteed profit claims', 'Maintain respectful and professional conduct', 'Not share misleading or illegal content'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: greenColor }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="leading-relaxed mt-3" style={{ color: textMuted }}>
                  FourXclub reserves the right to moderate, suspend, or terminate access to any user violating these rules without prior notice.
                </p>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>8</span>
                  Subscription, Pricing & Free Trial
                </h2>
                <ul className="space-y-1 ml-4">
                  {[
                    'Community access is provided on a monthly subscription basis',
                    'The subscription fee is ₹2,000 per month, subject to change',
                    'The first month may be offered free at the discretion of FourXclub',
                    'Subscription fees, once charged, are non-refundable unless stated otherwise',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: purpleColor }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>9</span>
                  Intellectual Property
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  All content including videos, live sessions, documents, graphics, and learning material are the intellectual property of FourXclub. Users are strictly prohibited from screen recording, redistributing content, sharing login credentials, or republishing material without written permission. Violation may result in termination of access and legal action.
                </p>
              </div>

              {/* Section 10 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>10</span>
                  Limitation of Liability
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  To the maximum extent permitted by law, FourXclub and its affiliates shall not be liable for any direct or indirect losses, damages, emotional distress, or financial consequences arising from the use of the platform.
                </p>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>11</span>
                  Termination of Access
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  FourXclub reserves the right to suspend or terminate access at any time, without notice, for violations of these Terms or misuse of the platform.
                </p>
              </div>

              {/* Section 12 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>12</span>
                  Governing Law
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of Indian courts.
                </p>
              </div>

              {/* Section 13 */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: purpleColor }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>13</span>
                  Acknowledgement
                </h2>
                <p className="leading-relaxed" style={{ color: textMuted }}>
                  By using FourXclub, you acknowledge that you understand the risks involved in trading and that you are solely responsible for your actions and decisions. If you do not agree with any part of these Terms, please discontinue use of the platform immediately.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="p-6 rounded-xl mt-6" style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}` }}>
                <h3 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: greenColor }}>Important Disclaimer</h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
                  FourXclub does not facilitate, recommend, or assist in accessing any broker, exchange, trading platform, or financial service provider. Any instruments, markets, or trading examples discussed on the platform are for educational illustration only and may not be permitted for trading by residents of certain jurisdictions, including India. Users are solely responsible for ensuring that any trading activity they undertake complies with applicable laws, regulations, and guidelines, including those issued by the RBI, FEMA, and SEBI. FourXclub bears no responsibility for the legality, compliance, or consequences of users&apos; trading activities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: bgCard, borderTop: `1px solid ${borderColor}` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm" style={{ color: textMuted }}>© 2026 FourXclub. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 mt-3">
            <Link href="/privacy" className="text-sm transition-opacity hover:opacity-80" style={{ color: purpleColor }}>Privacy Policy</Link>
            <Link href="/" className="text-sm transition-opacity hover:opacity-80" style={{ color: greenColor }}>Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
