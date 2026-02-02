'use client';

import {
  ArrowRight, Users, Video, Lock, Sparkles, Check,
  Star, Award, Zap, Globe, Heart
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import RazorpayCheckout from './RazorpayCheckout';

interface HomePageClientProps {
  isAuthenticated: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomePageClient({ isAuthenticated }: HomePageClientProps) {
  const [refCode, setRefCode] = useState('REF-XXXXX');
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [hasCourseAccess, setHasCourseAccess] = useState(false);

  // Debugging auth
  useEffect(() => {
    console.log('[Auth Status]', isAuthenticated ? 'Signed In' : 'Not Signed In');
  }, [isAuthenticated]);

  const fetchStatus = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const r = await fetch(`${API_URL}/api/user/status`, {
          credentials: 'include',
        });
        const data = await r.json();
        if (data.success) {
          setHasCourseAccess(data.courseAccess?.hasAccess || false);
        }
      } catch (err) {
        console.error('Failed to fetch user status:', err);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowTerms(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    // Wrap in a microtask to avoid synchronous state updates during render
    Promise.resolve().then(() => {
      fetchStatus();
    });
  }, [fetchStatus]);

  const generateCode = () => {
    const code = 'REF-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    setRefCode(code);
    setCopied(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const videos = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: `Video ${i + 1}`,
    src: `/encrypted/course/video-${i + 1}.mp4`,
  }));

  // Color scheme
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
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ backgroundColor: `${bgPrimary}80`, borderBottom: `1px solid ${borderColor}` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg" style={{ border: `2px solid ${greenColor}` }}>
                  <img src="fxclogo.webp" alt="FourXclub Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-xl" style={{ color: greenColor }}>FourXclub</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#course" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: purpleColor }}>Course</a>
                <a href="#community" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: purpleColor }}>Community</a>
                <a href="#pricing" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: purpleColor }}>Pricing</a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: greenColor, color: bgPrimary }}>
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-80" style={{ color: textLight }}>
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2" style={{ backgroundColor: greenColor, color: bgPrimary }}>
                      Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${greenColor}15` }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${purpleColor}15` }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full text-sm" style={{ backgroundColor: `${greenColor}20`, color: greenColor, border: `1px solid ${greenColor}50` }}>
              <Sparkles className="w-3 h-3" />
              Now Live: Transform Your Skills
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: greenColor }}>
              Built on Analysis.{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${greenColor}, ${purpleColor}, ${greenColor})` }}>
                Backed by Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: textLight }}>
              Learn how institutional traders read the market: with structured strategies, real chart breakdowns, and disciplined risk management. No hype. No signals. Just skill.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowCourseModal(true)}
                className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition-colors"
                style={{ backgroundColor: purpleColor, color: textLight }}
              >
                Join Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/auth/signin?pdf=true">
                <button
                  className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition-colors"
                  style={{ backgroundColor: greenColor, color: bgPrimary }}
                >
                  Claim your 1st FREE PDF to kickstart your journey
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm" style={{ color: textMuted }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2" style={{ backgroundImage: `linear-gradient(to bottom right, ${greenColor}, ${purpleColor})`, borderColor: bgPrimary }} />
                  ))}
                </div>
                <span className="font-medium" style={{ color: textLight }}>500+ active learners</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4" style={{ fill: greenColor, color: greenColor }} />
                ))}
                <span className="ml-2 font-medium" style={{ color: textLight }}>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32" style={{ backgroundColor: bgCard }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor, border: `1px solid ${purpleColor}50` }}>
              Mission &amp; Vision
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: greenColor }}>A Trading Ecosystem</h2>
            <p className="text-lg leading-relaxed" style={{ color: textLight }}>
              At FourXclub, our aim is simple: to educate traders the right way.
              We are a transparent, skill-focused trading community built by professionals with 7+ years of real market experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Real-Time Market Learning", desc: "Learn by observing markets as they move." },
              { icon: Users, title: "Focused Trading Community", desc: "A small, serious group of learners and traders." },
              { icon: Award, title: "Experienced Trader Access", desc: "Direct interaction with 7+ year experienced traders." },
              { icon: Check, title: "Skill Over Shortcuts", desc: "Focus on building discipline and long-term skills." },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${greenColor}20` }}>
                  <item.icon className="w-6 h-6" style={{ color: greenColor }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: purpleColor }}>{item.title}</h3>
                <p className="leading-relaxed" style={{ color: textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview Section */}
      <section id="course" className="py-20 md:py-32" style={{ backgroundColor: bgPrimary }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor, border: `1px solid ${greenColor}50` }}>
              Premium Course
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: purpleColor }}>FourXclub Core Trading Course</h2>
            <p className="text-lg leading-relaxed" style={{ color: textLight }}>
              10 structured video lessons, designed to take you from basics to professional-level thinking.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Course Preview Card */}
              <div className="overflow-hidden rounded-xl shadow-2xl" style={{ backgroundColor: bgCard, border: `2px solid ${purpleColor}50`, boxShadow: `0 25px 50px -12px ${purpleColor}30` }}>
                <div className="relative aspect-video p-8 flex items-center justify-center" style={{ backgroundImage: `linear-gradient(to bottom right, ${greenColor}, ${purpleColor})` }}>
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: `${bgPrimary}ee` }}>
                      <Lock className="w-10 h-10" style={{ color: greenColor }} />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${bgPrimary}ee`, color: greenColor }}>Encrypted</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: greenColor }}>Professional Trading Program</h3>
                  <p className="mb-4 leading-relaxed" style={{ color: textMuted }}>Market structure, strategy logic, risk management, and trading psychology.</p>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4 text-sm" style={{ color: textMuted }}>
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        <span className="ml-2 font-semibold" style={{ color: textLight }}>10 videos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="line-through">Rs.3499</span>
                        <span className="ml-2 font-semibold" style={{ color: greenColor }}>Rs.1499</span>
                      </div>
                    </div>
                    {isAuthenticated ? (
                      hasCourseAccess ? (
                        <Link href="/course">
                          <button className="px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: greenColor, color: bgPrimary }}>Watch</button>
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setShowCourseModal(true);
                          }}
                          className="px-4 py-2 text-sm font-medium rounded-lg"
                          style={{ backgroundColor: purpleColor, color: textLight }}
                        >
                          Buy Now
                        </button>
                      )
                    ) : (
                      <Link href="/auth/signin">
                        <button className="px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: purpleColor, color: textLight }}>Enroll Now</button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-6" style={{ color: purpleColor }}>What You Will Get</h3>
                {[
                  "10 structured, high-quality trading videos",
                  "Beginner-to-advanced learning path",
                  "Strategy logic, not signals or tips",
                  "Real-market examples and chart breakdowns",
                  "Lifetime access to all course videos",
                  "Certificate of completion",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${greenColor}20` }}>
                      <Check className="w-4 h-4" style={{ color: greenColor }} />
                    </div>
                    <span className="text-lg leading-relaxed" style={{ color: textLight }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 md:py-32" style={{ backgroundColor: bgCard }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor, border: `1px solid ${purpleColor}50` }}>
              <Users className="w-3 h-3" />
              Exclusive Community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: greenColor }}>Join the FourXclub Trading Community</h2>
            <p className="text-lg leading-relaxed" style={{ color: textLight }}>
              A private, well-moderated trading community for serious traders.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-xl shadow-2xl" style={{ backgroundColor: bgPrimary, border: `2px solid ${greenColor}50` }}>
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>
                    <Zap className="w-4 h-4" />
                    First Month Free
                  </div>
                  <h3 className="text-3xl font-bold" style={{ color: purpleColor }}>Live Trading Discord</h3>
                  <p className="leading-relaxed" style={{ color: textMuted }}>Exclusive Discord where traders learn together and stay disciplined.</p>
                  <div className="space-y-3">
                    {[
                      "Weekly live discussions and Q&A",
                      "Beginner-friendly environment",
                      "Direct access to experienced traders",
                      "Network with serious traders",
                      "No signals, no spam, no hype",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: greenColor }} />
                        <span style={{ color: textLight }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center" style={{ backgroundColor: `${purpleColor}10` }}>
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                      <h4 className="font-bold text-xl mb-2" style={{ color: greenColor }}>Refer &amp; Earn Free Access</h4>
                      <p className="text-sm mb-4 leading-relaxed" style={{ color: textMuted }}>Share your referral code. Both get 15 extra days free.</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-3 rounded-lg font-mono text-sm" style={{ backgroundColor: bgPrimary, color: purpleColor }}>{refCode}</div>
                        <button onClick={generateCode} className="px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: greenColor, color: bgPrimary }}>Generate</button>
                        <button onClick={copyCode} className="px-4 py-2 text-sm font-medium rounded-lg" style={{ border: `1px solid ${borderColor}`, color: textLight }}>Copy</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg text-center" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <div className="text-2xl font-bold" style={{ color: greenColor }}>+15</div>
                        <div className="text-xs" style={{ color: textMuted }}>Extra Days Free</div>
                      </div>
                      <div className="p-4 rounded-lg text-center" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <Heart className="w-6 h-6 mx-auto mb-1" style={{ color: purpleColor }} />
                        <div className="text-xs" style={{ color: textMuted }}>Per Referral</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32" style={{ backgroundColor: bgPrimary }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor, border: `1px solid ${greenColor}50` }}>
              Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: purpleColor }}>How Access Works</h2>
            <p className="text-lg leading-relaxed" style={{ color: textLight }}>Pay only for what you need. Learn at your pace.</p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Course Only */}
            <div className="p-6 rounded-xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: greenColor }}>Course Access</h3>
                <p className="leading-relaxed" style={{ color: textMuted }}>Perfect for self-paced learners</p>
              </div>
              <div className="mb-6">
                <span className="line-through" style={{ color: textMuted }}>INR 3000</span>
                <span className="text-4xl font-bold ml-2" style={{ color: greenColor }}>INR 1499</span>
                <div className="text-sm" style={{ color: textMuted }}>one-time payment</div>
              </div>
              <ul className="space-y-3 mb-6">
                {["10 video modules", "Lifetime course access", "Certificate of completion"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: greenColor }} />
                    <span style={{ color: textLight }}>{feature}</span>
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                hasCourseAccess ? (
                  <Link href="/course" className="w-full">
                    <button className="w-full px-4 py-2 font-medium rounded-lg" style={{ backgroundColor: greenColor, color: bgPrimary }}>View Course</button>
                  </Link>
                ) : (
                  <RazorpayCheckout
                    type="course"
                    buttonText="Get Started"
                    className="w-full px-4 py-2 font-medium rounded-lg"
                    onSuccess={() => setHasCourseAccess(true)}
                  />
                )
              ) : (
                <Link href="/auth/signin">
                  <button className="w-full px-4 py-2 font-medium rounded-lg" style={{ backgroundColor: purpleColor, color: textLight }}>Get Started</button>
                </Link>
              )}
            </div>

            {/* Community Only */}
            <div className="p-6 rounded-xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: purpleColor }}>Community Access</h3>
                <p className="leading-relaxed" style={{ color: textMuted }}>Join the Discord family</p>
              </div>
              <div className="mb-4">
                <div className="text-4xl font-bold" style={{ color: purpleColor }}>INR 2000</div>
                <div className="text-sm" style={{ color: textMuted }}>per month</div>
              </div>
              <div className="inline-block px-3 py-1 mb-6 rounded-full text-sm font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>First month free</div>
              <ul className="space-y-3 mb-6">
                {["Live trading sessions", "1-on-1 mentorship", "Professional networking"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: purpleColor }} />
                    <span style={{ color: textLight }}>{feature}</span>
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <RazorpayCheckout
                  type="discord_subscription"
                  buttonText="Access Community"
                  className="w-full px-4 py-2 font-medium rounded-lg"
                />
              ) : (
                <Link href="/auth/signin">
                  <button className="w-full px-4 py-2 font-medium rounded-lg" style={{ backgroundColor: purpleColor, color: textLight }}>Access Community</button>
                </Link>
              )}
            </div>

            {/* Complete Package */}
            <div className="p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:scale-105" style={{ backgroundColor: bgCard, border: `2px solid ${greenColor}`, boxShadow: `0 25px 50px -12px ${greenColor}40` }}>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: greenColor, color: bgPrimary }}>Most Popular</span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: greenColor }}>Complete Trading Setup</h3>
                <p className="leading-relaxed" style={{ color: textMuted }}>Course + Community</p>
              </div>
              <div className="mb-4">
                <div className="text-4xl font-bold" style={{ color: greenColor }}>INR 2499</div>
                <div className="text-sm" style={{ color: textMuted }}>one-time + INR 2000/mo</div>
              </div>
              <div className="inline-block px-3 py-1 mb-6 rounded-full text-sm font-medium" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>Save INR 1000</div>
              <ul className="space-y-3 mb-6">
                {["1st month Discord free", "Lifetime course access", "Priority support"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: greenColor }} />
                    <span style={{ color: textLight }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowCourseModal(true);
                }}
                className="w-full px-4 py-2 font-medium rounded-lg"
                style={{ backgroundColor: greenColor, color: bgPrimary, boxShadow: `0 10px 25px -5px ${greenColor}50` }}
              >
                Get Full Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(to bottom right, ${greenColor}, ${purpleColor})` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: bgPrimary }}>Learn Trading in Real Time</h2>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: bgPrimary }}>
              A focused trading community where learning happens live in the market.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16" style={{ backgroundColor: bgCard, borderTop: `1px solid ${borderColor}` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: `2px solid ${greenColor}` }}>
                  <img src="fxclogo.webp" alt="FourXclub Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-xl" style={{ color: greenColor }}>FourXclub</span>
              </div>
              <p className="text-sm" style={{ color: textMuted }}>Live trading • Real discussions • No signals • No hype</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: purpleColor }}>Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#course" style={{ color: textMuted }}>Courses</a></li>
                <li><a href="#community" style={{ color: textMuted }}>Community</a></li>
                <li><a href="#pricing" style={{ color: textMuted }}>Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: purpleColor }}>Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.instagram.com/fourxclub" target="_blank" rel="noopener noreferrer" style={{ color: textMuted }}>Instagram</a></li>
                <li><a href="https://discord.gg/aAUk8d73KD" target="_blank" rel="noopener noreferrer" style={{ color: textMuted }}>Discord</a></li>
                <li><a href="mailto:hello.fourxclub@gmail.com" style={{ color: textMuted }}>Email</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: purpleColor }}>Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setShowTerms(true)} style={{ color: textMuted }}>Terms &amp; conditions</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${borderColor}` }}>
            <p className="text-sm" style={{ color: textMuted }}>© 2026 FourXclub. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" style={{ color: textMuted }}><Globe className="w-5 h-5" /></a>
              <a href="#" style={{ color: textMuted }}><Users className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowTerms(false)} />
          <div className="relative z-10 max-w-3xl w-full rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: bgCard }}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <h2 className="text-xl font-bold" style={{ color: greenColor }}>Terms &amp; Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="text-sm px-3 py-1 rounded" style={{ color: textLight }}>Close</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto text-sm leading-relaxed" style={{ color: textLight }}>
              <p className="font-semibold" style={{ color: purpleColor }}>Last Updated: January 2026</p>
              <p className="mt-4">Welcome to FourXclub. These Terms govern your access to and use of our website, courses, and community platform.</p>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowCourseModal(false)} />
          <div className="relative z-10 max-w-5xl w-full rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: bgCard }}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: greenColor }}>FourXclub Core Course</h2>
                <p className="text-sm" style={{ color: textMuted }}>10 secure, encrypted videos</p>
              </div>
              <div className="flex gap-3 items-center">
                {!hasCourseAccess ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${purpleColor}20`, color: purpleColor }}>Locked</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>Access granted</span>
                )}
                <button onClick={() => setShowCourseModal(false)} className="text-sm px-3 py-1 rounded" style={{ color: textLight }}>Close</button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {!hasCourseAccess ? (
                <>
                  <p className="text-sm" style={{ color: textMuted }}>Preview the titles below. Purchase to unlock.</p>
                  <ul className="space-y-2 mt-4">
                    {videos.map((v) => (
                      <li key={v.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>{v.id}</div>
                          <div className="text-sm font-medium" style={{ color: textLight }}>{v.title}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm" style={{ color: textMuted }}>
                          <Lock className="w-4 h-4" />
                          <span>Locked</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm" style={{ color: textMuted }}>All videos are now available for streaming.</p>
                  <ul className="space-y-2 mt-4">
                    {videos.map((v) => (
                      <Link key={v.id} href="/course" className="block outline-none">
                        <li className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors" style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>{v.id}</div>
                            <div className="text-sm font-medium" style={{ color: textLight }}>{v.title}</div>
                          </div>
                          <div className="flex items-center gap-3 text-sm" style={{ color: greenColor }}>
                            <ArrowRight className="w-4 h-4" />
                            <span>Watch</span>
                          </div>
                        </li>
                      </Link>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="p-6 flex items-center justify-between gap-4" style={{ borderTop: `1px solid ${borderColor}` }}>
              {!hasCourseAccess ? (
                <div className="flex items-center gap-4 w-full justify-between">
                  <div>
                    <div className="text-sm" style={{ color: textMuted }}>Course price</div>
                    <div className="text-xl font-bold" style={{ color: greenColor }}>INR 1499</div>
                  </div>
                  {isAuthenticated ? (
                    <RazorpayCheckout
                      type="course"
                      buttonText="Purchase & Unlock"
                      onSuccess={() => {
                        setHasCourseAccess(true);
                      }}
                    />
                  ) : (
                    <Link href="/auth/signin">
                      <button
                        className="px-4 py-2 rounded-lg"
                        style={{ backgroundColor: greenColor, color: bgPrimary }}
                      >
                        Sign in to Purchase
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm" style={{ color: textMuted }}>You now have access to all course videos.</div>
                  <Link href="/course">
                    <button className="px-4 py-2 rounded-lg" style={{ backgroundColor: greenColor, color: bgPrimary }}>Go to Course Player</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}