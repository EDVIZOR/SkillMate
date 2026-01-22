import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const handleStartDiscovery = (): void => {
    window.location.href = '/assessment/start';
  };

  const handleHeroCTA = (): void => {
    console.log('Start Domain Discovery clicked');
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-[10px] border-b border-gray-200 py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="logo-text text-2xl font-bold">SkillMate</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="md">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="md">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-0 bg-gradient-to-b from-purple-50 to-white min-h-[calc(100vh-80px)] flex items-center" aria-label="Hero section">
        <div className="container">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="heading-1 text-6xl leading-[1.1] tracking-[-0.03em] text-gray-900 max-w-full mb-4 max-md:text-4xl">
              Confused About Which CS Domain to Choose?
            </h1>
            <p className="body-large text-xl leading-relaxed text-gray-600 max-w-3xl mb-3 max-md:text-base">
              Just entered Engineering after 12th?<br />
              Our AI helps you discover the right CS domain based on your interests and thinking style — no prior coding knowledge required.
            </p>
            <div className="mt-2 mb-3">
              <p className="body-small text-sm font-medium tracking-[0.01em] text-gray-500">Designed especially for first-year CS, IT & AI-ML students</p>
            </div>
            <div className="flex flex-col gap-4 items-center mt-6 max-md:w-full">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full md:w-auto md:min-w-[280px] text-lg font-semibold py-6 px-12 shadow-purple rounded-xl hover:-translate-y-1 hover:shadow-[0_20px_30px_-5px_rgba(124,58,237,0.2),0_10px_10px_-5px_rgba(124,58,237,0.1)]"
                onClick={handleHeroCTA}
                aria-label="Start your domain discovery journey"
              >
                Start Domain Discovery
              </Button>
              <a 
                href="#how-it-works" 
                className="hero-cta-secondary text-purple-600 no-underline text-base font-medium py-3 transition-all duration-200 relative inline-flex items-center gap-2 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600 focus-visible:rounded-sm"
                aria-label="Learn how SkillMate works"
              >
                Learn how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20 px-0 bg-white max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="heading-2 text-center mb-8 sm:mb-12 text-gray-900 text-3xl sm:text-4xl">Made for Students Like You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <Card variant="elevated" padding="lg" className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-5xl mb-2">🎓</div>
                  <p className="body-base text-gray-600 leading-relaxed m-0">Just completed 12th and entered Engineering</p>
                </div>
              </Card>
              <Card variant="elevated" padding="lg" className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-5xl mb-2">💻</div>
                  <p className="body-base text-gray-600 leading-relaxed m-0">CS / IT / AI-ML background</p>
                </div>
              </Card>
              <Card variant="elevated" padding="lg" className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-5xl mb-2">🤔</div>
                  <p className="body-base text-gray-600 leading-relaxed m-0">Not sure what Software, AI, or Data Science really mean</p>
                </div>
              </Card>
              <Card variant="elevated" padding="lg" className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-5xl mb-2">🚀</div>
                  <p className="body-base text-gray-600 leading-relaxed m-0">Want clarity before choosing a path</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 px-0 bg-gray-50 max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="heading-2 mb-12 text-gray-900 max-md:mb-8 max-md:text-3xl max-[480px]:mb-8">Why Choosing a Domain Feels So Confusing</h2>
            <div className="flex flex-col gap-6 mb-12 text-left max-md:gap-4 max-md:mb-8">
              <div className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:translate-x-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full mt-3 flex-shrink-0"></div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Too many domains, too many opinions</p>
              </div>
              <div className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:translate-x-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full mt-3 flex-shrink-0"></div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Friends say one thing, internet says another</p>
              </div>
              <div className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:translate-x-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full mt-3 flex-shrink-0"></div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Most students start coding without direction</p>
              </div>
              <div className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:translate-x-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full mt-3 flex-shrink-0"></div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Wrong choice leads to wasted time and stress</p>
              </div>
            </div>
            <div className="py-8 px-12 bg-gradient-primary-light rounded-xl border-l-4 border-purple-600 max-md:py-6 max-md:px-8">
              <p className="body-large text-purple-800 font-medium leading-relaxed m-0">
                Choosing the right direction early makes learning easier and careers stronger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How SkillMate Helps Section */}
      <section className="py-20 px-0 bg-white max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="heading-2 text-center mb-16 text-gray-900 max-md:mb-8 max-md:text-3xl max-[480px]:mb-8">How SkillMate Helps You</h2>
            <div className="flex items-center justify-center gap-8 flex-wrap max-lg:flex-col max-lg:gap-6 max-md:gap-4">
              <Card variant="default" padding="xl" className="flex-1 min-w-[280px] max-w-[320px] text-center relative flex flex-col items-center gap-4 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-purple max-lg:max-w-full max-md:min-w-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">1</div>
                <div className="text-5xl mt-4 mb-2">✍️</div>
                <h3 className="heading-4 mb-3 text-gray-900">Answer Simple Questions</h3>
                <p className="body-base text-gray-600 leading-relaxed m-0">
                  Share your interests, what excites you, and how you like to think through problems. 
                  No technical knowledge needed.
                </p>
              </Card>
              <div className="text-4xl text-purple-600 font-bold flex-shrink-0 max-lg:rotate-90 max-lg:my-2 max-md:my-1">→</div>
              <Card variant="default" padding="xl" className="flex-1 min-w-[280px] max-w-[320px] text-center relative flex flex-col items-center gap-4 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-purple max-lg:max-w-full max-md:min-w-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">2</div>
                <div className="text-5xl mt-4 mb-2">🤖</div>
                <h3 className="heading-4 mb-3 text-gray-900">AI Analyzes Your Interests</h3>
                <p className="body-base text-gray-600 leading-relaxed m-0">
                  Our system understands your thinking style and interests to find patterns 
                  that match different engineering domains.
                </p>
              </Card>
              <div className="text-4xl text-purple-600 font-bold flex-shrink-0 max-lg:rotate-90 max-lg:my-2 max-md:my-1">→</div>
              <Card variant="default" padding="xl" className="flex-1 min-w-[280px] max-w-[320px] text-center relative flex flex-col items-center gap-4 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-purple max-lg:max-w-full max-md:min-w-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">3</div>
                <div className="text-5xl mt-4 mb-2">✨</div>
                <h3 className="heading-4 mb-3 text-gray-900">Get Clear Suggestions</h3>
                <p className="body-base text-gray-600 leading-relaxed m-0">
                  Receive personalized domain recommendations with simple explanations 
                  of why each might be a good fit for you.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-0 bg-white max-md:py-12">
        <div className="container">
          <div className="text-center max-w-[800px] mx-auto">
            <h2 className="heading-3 mb-4 text-gray-900">You're Not Alone</h2>
            <p className="body-large mb-12 text-gray-600">
              Every first-year student feels this way. That's completely normal, and we're here to make it easier.
            </p>
            <div className="grid grid-cols-3 gap-8 max-lg:grid-cols-1 max-lg:gap-6">
              <Card variant="elevated" padding="lg" hover>
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="heading-5 mb-2 text-gray-900">Beginner-Friendly</h3>
                  <p className="body-base text-gray-600 m-0">
                    No prior knowledge needed. We explain everything in simple terms, just for you.
                  </p>
                </div>
              </Card>
              <Card variant="elevated" padding="lg" hover>
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="text-4xl mb-3">🤝</div>
                  <h3 className="heading-5 mb-2 text-gray-900">Supportive Community</h3>
                  <p className="body-base text-gray-600 m-0">
                    Connect with other first-year students who are on the same journey as you.
                  </p>
                </div>
              </Card>
              <Card variant="elevated" padding="lg" hover>
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="text-4xl mb-3">💜</div>
                  <h3 className="heading-5 mb-2 text-gray-900">No Pressure</h3>
                  <p className="body-base text-gray-600 m-0">
                    Take your time. Explore at your own pace. There's no rush or competition here.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Supported CS Domains Section */}
      <section id="how-it-works" className="py-20 px-0 bg-gray-50 max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 text-gray-900">CS Domains You'll Explore</h2>
          </div>
          <div className="grid grid-cols-5 gap-6 mb-8 max-lg:grid-cols-3 max-lg:gap-4 max-md:grid-cols-2 max-md:gap-4 max-[480px]:grid-cols-1 max-[480px]:gap-4">
            <Card variant="default" padding="xl" className="text-center flex flex-col items-center gap-4 min-h-[180px] justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple max-[480px]:min-h-0">
              <div className="text-5xl mb-2">💻</div>
              <h3 className="heading-4 m-0 text-gray-900">Software Development</h3>
            </Card>
            <Card variant="default" padding="xl" className="text-center flex flex-col items-center gap-4 min-h-[180px] justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple max-[480px]:min-h-0">
              <div className="text-5xl mb-2">🤖</div>
              <h3 className="heading-4 m-0 text-gray-900">AI & Machine Learning</h3>
            </Card>
            <Card variant="default" padding="xl" className="text-center flex flex-col items-center gap-4 min-h-[180px] justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple max-[480px]:min-h-0">
              <div className="text-5xl mb-2">📊</div>
              <h3 className="heading-4 m-0 text-gray-900">Data Science</h3>
            </Card>
            <Card variant="default" padding="xl" className="text-center flex flex-col items-center gap-4 min-h-[180px] justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple max-[480px]:min-h-0">
              <div className="text-5xl mb-2">🛡️</div>
              <h3 className="heading-4 m-0 text-gray-900">Cybersecurity</h3>
            </Card>
            <Card variant="default" padding="xl" className="text-center flex flex-col items-center gap-4 min-h-[180px] justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-purple max-[480px]:min-h-0">
              <div className="text-5xl mb-2">☁️</div>
              <h3 className="heading-4 m-0 text-gray-900">Cloud & DevOps</h3>
            </Card>
          </div>
          <p className="body-base text-center text-gray-600 italic mt-8">
            Explained in beginner-friendly language — no technical background required.
          </p>
        </div>
      </section>

      {/* Why AI Section */}
      <section className="py-20 px-0 bg-white max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="max-w-[800px] mx-auto">
            <h2 className="heading-2 text-center mb-12 text-gray-900 max-md:mb-8 max-md:text-3xl max-[480px]:mb-8">How AI Is Used (In Simple Words)</h2>
            <div className="flex flex-col gap-6 mb-12 max-md:gap-4 max-md:mb-8">
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:translate-x-1">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 mt-1">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Understands your interests and thinking style</p>
              </div>
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:translate-x-1">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 mt-1">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Compares multiple CS domains intelligently</p>
              </div>
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:translate-x-1">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 mt-1">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Ranks which domains suit you best</p>
              </div>
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:translate-x-1">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 mt-1">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Explains why a domain fits you</p>
              </div>
            </div>
            <div className="py-8 px-12 bg-gradient-primary-light rounded-xl border-l-4 border-purple-600 max-md:py-6 max-md:px-8">
              <p className="body-large text-purple-800 font-semibold leading-relaxed m-0">
                This is guidance, not guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance Section */}
      <section className="py-20 px-0 bg-gray-50 max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="max-w-[900px] mx-auto">
            <h2 className="heading-2 text-center mb-12 text-gray-900 max-md:mb-8 max-md:text-3xl max-[480px]:mb-8">No Pressure. No Judgement.</h2>
            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-9 h-9 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">No exam</p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-9 h-9 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">No pass/fail</p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-9 h-9 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">No technical knowledge needed</p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-9 h-9 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Can retake anytime</p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-9 h-9 bg-gradient-primary text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">✓</div>
                <p className="body-large text-gray-600 leading-relaxed m-0">Built to guide, not force</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section py-20 px-0 bg-gradient-dark text-white relative overflow-hidden max-md:py-12 max-[480px]:py-8">
        <div className="container">
          <div className="max-w-[800px] mx-auto text-center relative z-[1] flex flex-col items-center gap-12 max-md:gap-8 max-[480px]:gap-8">
            <div className="flex flex-col gap-4">
              <p className="body-large text-2xl font-medium leading-relaxed m-0 opacity-95 max-md:text-xl max-[480px]:text-lg">You are not late.</p>
              <p className="body-large text-2xl font-medium leading-relaxed m-0 opacity-95 max-md:text-xl max-[480px]:text-lg">You are not behind.</p>
              <p className="body-large text-2xl font-medium leading-relaxed m-0 opacity-95 max-md:text-xl max-[480px]:text-lg">You just need the right direction.</p>
            </div>
            <div className="mt-6">
              <Button 
                variant="primary" 
                size="lg" 
                className="min-w-[300px] text-lg font-semibold py-6 px-12 shadow-[0_10px_25px_rgba(0,0,0,0.2)] bg-white text-purple-700 border-none hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:bg-purple-50 hover:text-purple-800 max-md:min-w-0 max-md:w-full max-md:max-w-[400px]"
                onClick={handleStartDiscovery}
                aria-label="Start your domain discovery assessment"
              >
                Discover My CS Domain
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-0 bg-gray-900 text-gray-300 max-md:py-12">
        <div className="container">
          <div className="grid grid-cols-[2fr_3fr] gap-16 mb-12 max-lg:grid-cols-1 max-lg:gap-12">
            <div className="flex flex-col gap-4">
              <span className="logo-text text-white text-2xl font-bold">SkillMate</span>
              <p className="body-small text-gray-400 m-0">
                Your friendly guide to engineering domains
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="flex flex-col gap-4">
                <h4 className="heading-5 text-white mb-2">Product</h4>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">Features</a>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">How It Works</a>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">Pricing</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="heading-5 text-white mb-2">Support</h4>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">Help Center</a>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">Contact Us</a>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">FAQ</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="heading-5 text-white mb-2">Legal</h4>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">Privacy Policy</a>
                <a href="#" className="text-gray-400 no-underline transition-colors duration-200 hover:text-white">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p className="body-small m-0">© 2024 SkillMate. Made with 💜 for first-year engineering students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
