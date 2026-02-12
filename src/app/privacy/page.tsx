'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    const bgPrimary = '#0a0a0a';
    const bgCard = '#151515';
    const greenColor = '#6BBF6A';
    const purpleColor = '#9B7BD3';
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
                        <Link href="/terms" className="text-sm font-medium transition-opacity hover:opacity-80" style={{ color: purpleColor }}>
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Banner */}
            <section className="pt-28 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${purpleColor}10` }} />
                    <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${greenColor}08` }} />
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-block px-4 py-2 mb-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor, border: `1px solid ${purpleColor}50` }}>
                        Legal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: purpleColor }}>Privacy Policy</h1>
                    <p className="text-sm" style={{ color: textMuted }}>Last Updated: January 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="rounded-xl p-8 md:p-10 space-y-8" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>

                            <p className="leading-relaxed" style={{ color: textMuted }}>
                                At FourXclub, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and protect your data when you access our website, courses, and community platform.
                            </p>

                            {/* Section 1 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>1</span>
                                    Information We Collect
                                </h2>
                                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                                    We may collect the following types of information when you use FourXclub:
                                </p>
                                <ul className="space-y-2 ml-4">
                                    {[
                                        { label: 'Personal Information', desc: 'Name, email address, and profile information provided during account creation (via Google sign-in).' },
                                        { label: 'Payment Information', desc: 'Payment details processed securely through Razorpay. We do not store your card details on our servers.' },
                                        { label: 'Usage Data', desc: 'Browser type, device information, pages visited, time spent on the platform, and other analytics data.' },
                                        { label: 'Communication Data', desc: 'Messages, feedback, and interactions within our community platform and support channels.' },
                                    ].map((item, i) => (
                                        <li key={i} className="text-sm" style={{ color: textMuted }}>
                                            <span className="font-medium" style={{ color: textLight }}>{item.label}:</span> {item.desc}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 2 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>2</span>
                                    How We Use Your Information
                                </h2>
                                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                                    We use the collected information for the following purposes:
                                </p>
                                <ul className="space-y-1 ml-4">
                                    {[
                                        'To provide and maintain our services, including course access and community features',
                                        'To process payments and manage subscriptions',
                                        'To authenticate your identity and secure your account',
                                        'To communicate updates, announcements, and support responses',
                                        'To improve our platform, content, and user experience',
                                        'To enforce our Terms & Conditions and community guidelines',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: textMuted }}>
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: purpleColor }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 3 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>3</span>
                                    Data Sharing & Third Parties
                                </h2>
                                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                                    We do not sell, rent, or trade your personal information. We may share data with:
                                </p>
                                <ul className="space-y-1 ml-4">
                                    {[
                                        'Razorpay – for secure payment processing',
                                        'Google – for authentication via Google sign-in',
                                        'Hosting & infrastructure providers – to deliver our services reliably',
                                        'Legal authorities – if required by law or to protect our rights',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: textMuted }}>
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: greenColor }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 4 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>4</span>
                                    Cookies & Tracking
                                </h2>
                                <p className="leading-relaxed" style={{ color: textMuted }}>
                                    We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain features of the platform.
                                </p>
                            </div>

                            {/* Section 5 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>5</span>
                                    Data Security
                                </h2>
                                <p className="leading-relaxed" style={{ color: textMuted }}>
                                    We implement industry-standard security measures to protect your personal data, including encryption, secure authentication, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>6</span>
                                    Data Retention
                                </h2>
                                <p className="leading-relaxed" style={{ color: textMuted }}>
                                    We retain your personal data for as long as your account is active or as needed to provide our services. If you wish to delete your account and associated data, please contact us at hello.fourxclub@gmail.com. Some data may be retained for legal or operational purposes even after account deletion.
                                </p>
                            </div>

                            {/* Section 7 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>7</span>
                                    Your Rights
                                </h2>
                                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                                    Depending on your jurisdiction, you may have the following rights regarding your personal data:
                                </p>
                                <ul className="space-y-1 ml-4">
                                    {[
                                        'Right to access your personal data',
                                        'Right to correct inaccurate or incomplete data',
                                        'Right to request deletion of your data',
                                        'Right to withdraw consent for data processing',
                                        'Right to data portability',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: purpleColor }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="leading-relaxed mt-3" style={{ color: textMuted }}>
                                    To exercise any of these rights, contact us at <a href="mailto:hello.fourxclub@gmail.com" className="underline transition-opacity hover:opacity-80" style={{ color: greenColor }}>hello.fourxclub@gmail.com</a>.
                                </p>
                            </div>

                            {/* Section 8 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>8</span>
                                    Children&apos;s Privacy
                                </h2>
                                <p className="leading-relaxed" style={{ color: textMuted }}>
                                    FourXclub is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware of such data, we will take steps to delete it promptly.
                                </p>
                            </div>

                            {/* Section 9 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>9</span>
                                    Changes to This Policy
                                </h2>
                                <p className="leading-relaxed" style={{ color: textMuted }}>
                                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. Any updates will be posted on this page with the &quot;Last Updated&quot; date revised accordingly. We encourage you to review this page periodically.
                                </p>
                            </div>

                            {/* Section 10 */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: greenColor }}>
                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>10</span>
                                    Contact Us
                                </h2>
                                <p className="leading-relaxed mb-3" style={{ color: textMuted }}>
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please reach out to us:
                                </p>
                                <div className="p-4 rounded-lg" style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}` }}>
                                    <div className="space-y-2 text-sm">
                                        <p style={{ color: textMuted }}>
                                            <span className="font-medium" style={{ color: textLight }}>Email:</span>{' '}
                                            <a href="mailto:hello.fourxclub@gmail.com" className="underline transition-opacity hover:opacity-80" style={{ color: greenColor }}>hello.fourxclub@gmail.com</a>
                                        </p>
                                        <p style={{ color: textMuted }}>
                                            <span className="font-medium" style={{ color: textLight }}>Instagram:</span>{' '}
                                            <a href="https://www.instagram.com/fourxclub" target="_blank" rel="noopener noreferrer" className="underline transition-opacity hover:opacity-80" style={{ color: purpleColor }}>@fourxclub</a>
                                        </p>
                                        <p style={{ color: textMuted }}>
                                            <span className="font-medium" style={{ color: textLight }}>Discord:</span>{' '}
                                            <a href="https://discord.gg/aAUk8d73KD" target="_blank" rel="noopener noreferrer" className="underline transition-opacity hover:opacity-80" style={{ color: purpleColor }}>FourXclub Discord</a>
                                        </p>
                                    </div>
                                </div>
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
                        <Link href="/terms" className="text-sm transition-opacity hover:opacity-80" style={{ color: greenColor }}>Terms & Conditions</Link>
                        <Link href="/" className="text-sm transition-opacity hover:opacity-80" style={{ color: purpleColor }}>Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
