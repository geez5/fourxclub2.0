"use client";
import { 
  ArrowRight, Shield, Users, Video, Lock, Sparkles, Check, 
  Star, Award, TrendingUp, Zap, Globe, Heart 
} from 'lucide-react';
import { useState, useEffect } from 'react';


export default function HomePage() {
  const [refCode, setRefCode] = useState('REF-XXXXX');
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowTerms(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img 
                src="fourxclub-logo.jpeg" 
                alt="FourXclub Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-xl">FourXclub</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium hover:text-blue-600 transition-colors">
                About
              </a>
              <a href="#course" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Course
              </a>
              <a href="#community" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Community
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="w-3 h-3" />
              Now Live: Transform Your Skills
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Built on Analysis.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Backed by Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Learn how institutional traders read the market — with structured strategies, real chart breakdowns, and disciplined risk management. No hype. No signals. Just skill.
            </p>
            <div className="flex items-center justify-center">
              <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Join Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white"
                    />
                  ))}
                </div>
                <span className="font-medium">500+ active learners</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-gray-100/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-sm font-medium">
              Mission & Vision
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">A Trading Ecosystem</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At FourXclub, our aim is simple — to educate traders the right way.
We are a transparent, skill-focused trading community built by professionals with 7+ years of real market experience, not marketers selling false promises. Our mission is to guide learners from beginner to advanced levels through structured, affordable education that delivers real value. We envision a safe trading ecosystem where individuals become confident, self-sufficient, and capable of trading like professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Real-Time Market Learning", desc: "Learn by observing markets as they move. Sessions focus on structure, planning, and execution — not hindsight explanations." },
              { icon: Users, title: "Focused Trading Community", desc: "A small, serious group of learners and traders. No signals, no promotions, no noise — only meaningful discussions." },
              { icon: Award, title: "Experienced Trader Access", desc: "Direct interaction with traders having 7+ years of real market experience, including one-on-one guidance and chat support when required." },
              { icon: Check, title: "Skill Over Shortcuts", desc: "No guaranteed profits or quick wins. The focus is on building discipline, risk management, and long-term trading skills." },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-all duration-300 hover:shadow-xl group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                  <item.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview Section */}
      <section id="course" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 rounded-full bg-purple-50 text-purple-600 border border-purple-200 text-sm font-medium">
              Premium Course
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">FourXclub Core Trading Course</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              A focused, step-by-step trading course made of 10 structured video lessons, designed to take you from basics to professional-level thinking, protected to keep the knowledge exclusive.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Course Preview Card */}
              <div className="overflow-hidden rounded-xl border-2 border-blue-200 shadow-2xl shadow-blue-600/10 bg-white">
                <div className="relative aspect-video bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 p-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/90 flex items-center justify-center backdrop-blur-sm">
                      <Lock className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm text-sm font-medium">
                      Encrypted
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">Professional Trading Program</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    A carefully designed video course covering market structure, strategy logic, risk management, and trading psychology — built by traders with 7+ years of real market experience.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      <span className="line-through text-gray-500">INR 3499</span>
                      <span className="ml-2 font-semibold text-gray-900">INR 1499</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      <span className="line-through text-gray-500">Rs.3499</span>
                      <span className="ml-2 font-semibold text-gray-900">Rs.1499</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">What You'll Get</h3>
                {[
                  "10 structured, high-quality trading videos (paid course)",
                  "Beginner-to-advanced learning path",
                  "Strategy logic, not signals or tips",
                  "Real-market examples and chart breakdowns",
                  "Lifetime access to all course videos",
                  "Certificate of completion",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-600 transition-colors">
                      <Check className="w-4 h-4 text-blue-600 group-hover:text-white" />
                    </div>
                    <span className="text-lg leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-purple-50 text-purple-600 border border-purple-200 text-sm font-medium">
              <Users className="w-3 h-3" />
              Exclusive Community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the FourXclub Trading Community</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              A private, well-moderated trading community for serious traders — beginner-friendly, mentor-driven, and built to encourage real learning, personal guidance, and strong professional networking.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-xl border-2 border-purple-200 shadow-2xl bg-white">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    First Month Free
                  </div>
                  <h3 className="text-3xl font-bold">Live Trading Discord (Subscription-Based)</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get access to our exclusive Discord server where traders learn together, ask questions, and stay disciplined — guided by experienced traders.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Weekly live discussions, Q&A, and market analysis",
                      "Beginner-friendly yet structured learning environment",
                      "Direct access to experienced traders for personal guidance",
                      "Network with serious, like-minded traders",
                      "No signals, no spam, no hype — only real learning",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 md:p-10 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200">
                      <h4 className="font-bold text-xl mb-2">Refer & Earn Free Access</h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Share your unique referral code with friends.
If your friend subscribes using your code, both of you get 15 extra days of free Discord access.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-3 rounded-lg bg-gray-100 font-mono text-sm">{refCode}</div>
                        <button
                          onClick={generateCode}
                          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Generate
                        </button>
                        <button
                          onClick={copyCode}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-purple-600">+15</div>
                        <div className="text-xs text-gray-600">Extra Days Free</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 text-center">
                        <Heart className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Per Referral</div>
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
      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-sm font-medium">
              Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Access Works</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Pay only for what you need. Learn at your pace. Upgrade anytime.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Course Only */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Course Access</h3>
                <p className="text-gray-600 leading-relaxed">Perfect for self-paced learners</p>
              </div>
              <div className="mb-6">
                
                <span className="line-through text-gray-500">INR 1999</span>
                      <span className="text-4xl font-bold">INR 1499</span>
                <div className="text-sm text-gray-600">one-time payment</div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "10 video modules",
                  "Lifetime course access",
                  "Beginner to advanced content",
                  "Certificate of completion",
                  "No recurring fees"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full px-4 py-2 font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Get Started
              </button>
            </div>

            {/* Community Only */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Live Trading & Community Access</h3>
                <p className="text-gray-600 leading-relaxed">Join the Discord family</p>
              </div>
              <div className="mb-4">
                <div className="text-4xl font-bold">INR 1999</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
              <div className="inline-block px-3 py-1 mb-6 rounded-full bg-purple-50 text-purple-600 border border-purple-200 text-sm font-medium">
                First month free
              </div>
              <ul className="space-y-3 mb-6">
                {["Live trading sessions conducted in real market conditions", "Real-time discussion on trade planning, entries, and execution", "One-on-one interaction with traders having 7+ years of experience (chat + sessions as required)", "Opportunity to network with serious, long-term traders", "No signals, no promotions, no fake claims — only practical learning"].map(
                  (feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ),
                )}
              </ul>
              <button className="w-full px-4 py-2 font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Access Community
              </button>
            </div>

            {/* Complete Package */}
            <div className="p-6 rounded-xl border-2 border-blue-600 bg-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Complete Trading Setup</h3>
                <p className="text-gray-600 leading-relaxed">Course + Community. Everything you need.</p>
              </div>
              <div className="mb-4">
                <div className="text-4xl font-bold">INR 2499</div>
                <div className="text-sm text-gray-600">one-time + INR 1999/mo</div>
              </div>
              <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-sm font-medium">
                Save INR 999
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "Full 10-video course access",
                  "Private Discord subscription",
                  "Priority community support",
                  "1-on-1 mentorship sessions",
                  "Premium resources",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full px-4 py-2 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                Get Full Access 
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Learn Trading in Real Time. Not From Promises.</h2>
            <p className="text-xl mb-10 text-white/90 leading-relaxed">
              A focused trading community where learning happens live in the market. Observe real trades, discuss
              execution, and interact directly with traders who have 7+ years of real trading experience — beginner-friendly, but only for those serious about learning.
            </p>
            {/* CTA buttons removed as requested */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="fourxclub-logo.jpeg" 
                  alt="FourXclub Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="font-bold text-xl">FourXclub</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Live trading • Real discussions • No signals • No hype
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#course" className="hover:text-blue-600 transition-colors">
                    Courses
                  </a>
                </li>
                <li>
                  <a href="#community" className="hover:text-blue-600 transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-blue-600 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#referral" className="hover:text-blue-600 transition-colors">
                    Referrals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="https://www.instagram.com/fourxclub?igsh=Z2xnYmdlcTB5c2hu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/aAUk8d73KD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello.fourxclub@gmail.com"
                  className="hover:text-blue-600 transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Terms &amp; conditions
                </button>
              </li>
            </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2026 FourXclub. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">Discord</span>
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">GitHub</span>
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center p-6 sm:p-10"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTerms(false)}
          />
          <div className="relative z-10 max-w-3xl w-full bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Terms &amp; Conditions</h2>
              <button
                onClick={() => setShowTerms(false)}
                aria-label="Close terms"
                className="text-sm px-3 py-1 rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto text-sm leading-relaxed">
              <p className="font-semibold">Last Updated: January 2026</p>
              <p className="mt-4">
                Welcome to <strong>FourXclub</strong>. These Terms &amp; Conditions ("Terms") govern your access to and use of our website, courses, live sessions, and community platform. By accessing or using FourXclub, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree, please do not use the platform.
              </p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">1. Nature of Services</h3>
              <p className="mt-2">
                FourXclub is an <strong>educational and awareness-based platform</strong> focused on trading concepts, market understanding, and skill development. All content, discussions, sessions, and interactions are provided <strong>solely for educational and informational purposes</strong>.
              </p>
              <p className="mt-2"><strong>FourXclub does not provide:</strong></p>
              <ul className="list-disc ml-6 mt-2">
                <li>Investment advice</li>
                <li>Financial advice</li>
                <li>Trading recommendations</li>
                <li>Portfolio management services</li>
                <li>Guaranteed strategies or profit assurances</li>
              </ul>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">2. Market Risk Disclosure</h3>
              <p className="mt-2">
                Trading in financial markets involves <strong>substantial risk</strong> and may result in partial or complete loss of capital. Market conditions are volatile and unpredictable.
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Trading outcomes vary for every individual</li>
                <li>Past performance is not indicative of future results</li>
                <li>You may lose more than your initial investment</li>
              </ul>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">3. User Responsibility</h3>
              <p className="mt-2">
                All trading decisions made by you are <strong>entirely your own responsibility</strong>. FourXclub shall not be held responsible for any trading losses, missed opportunities, or financial outcomes resulting from the use of information shared on the platform.
              </p>
              <p className="mt-2">You are encouraged to consult a <strong>SEBI-registered financial advisor</strong> before making any investment or trading decisions.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">4. Live Trading Sessions Disclaimer</h3>
              <p className="mt-2">
                Live trading sessions conducted on FourXclub are for <strong>educational demonstration purposes only</strong>. These sessions are intended to explain market behavior, trade planning, and execution logic.
              </p>
              <p className="mt-2">They should <strong>not</strong> be considered trade signals, buy/sell instructions, or investment advice. Users are strongly advised <strong>not to blindly copy trades</strong>.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">5. One-on-One Interaction Disclaimer</h3>
              <p className="mt-2">
                Any one-on-one discussions, chats, or interactions with experienced traders or mentors are intended solely for <strong>knowledge sharing and educational guidance</strong> and do not constitute personalized financial advice.
              </p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">6. No Guarantee of Results</h3>
              <p className="mt-2">
                FourXclub makes <strong>no guarantees</strong> regarding profits, income, trading success, or skill outcomes. Success depends on multiple factors including discipline, risk management, psychology, and market conditions.
              </p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">7. Community Rules &amp; Conduct</h3>
              <p className="mt-2">To maintain a focused and safe learning environment, users agree to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Avoid spam, promotions, or signal selling</li>
                <li>Not make false or guaranteed profit claims</li>
                <li>Maintain respectful and professional conduct</li>
                <li>Not share misleading or illegal content</li>
              </ul>
              <p className="mt-2">FourXclub reserves the right to <strong>moderate, suspend, or terminate access</strong> to any user violating these rules without prior notice.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">8. Subscription, Pricing &amp; Free Trial</h3>
              <ul className="list-disc ml-6 mt-2">
                <li>Community access is provided on a <strong>monthly subscription basis</strong></li>
                <li>The subscription fee is <strong>₹2,000 per month</strong>, subject to change</li>
                <li>The first month may be offered <strong>free</strong> at the discretion of FourXclub</li>
                <li>Subscription fees, once charged, are <strong>non-refundable</strong> unless stated otherwise</li>
              </ul>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">9. Intellectual Property</h3>
              <p className="mt-2">All content including videos, live sessions, documents, graphics, and learning material are the <strong>intellectual property of FourXclub</strong>. Users are strictly prohibited from screen recording, redistributing content, sharing login credentials, or republishing material without written permission. Violation may result in termination of access and legal action.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">10. Limitation of Liability</h3>
              <p className="mt-2">To the maximum extent permitted by law, FourXclub and its affiliates shall <strong>not be liable</strong> for any direct or indirect losses, damages, emotional distress, or financial consequences arising from the use of the platform.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">11. Termination of Access</h3>
              <p className="mt-2">FourXclub reserves the right to suspend or terminate access at any time, without notice, for violations of these Terms or misuse of the platform.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">12. Governing Law</h3>
              <p className="mt-2">These Terms shall be governed by the <strong>laws of India</strong>. Any disputes shall be subject to the jurisdiction of Indian courts.</p>

              <hr className="my-4" />

              <h3 className="font-bold mt-4">13. Acknowledgement</h3>
              <p className="mt-2">By using FourXclub, you acknowledge that you understand the risks involved in trading and that you are solely responsible for your actions and decisions. If you do not agree with any part of these Terms, please discontinue use of the platform immediately.</p>

              <p className="mt-4 font-semibold">FourXclub</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}