import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Sparkles, ChevronRight, ChevronLeft,
  X, Zap, ShieldCheck, Radar, FileCode, CheckCircle2,
  ArrowUpRight, ArrowUp, Compass, Cpu, Layers, Server,
  Lock, Globe, FileText, Activity, Database, Check, Play,
  Workflow, GitBranch
} from 'lucide-react';
import { useAuth } from '../../store/auth';
import { playCyberSound } from '../../lib/playCyberSound';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Who We Are & What We Do 🛡️',
    subtitle: 'Autonomous DevSecOps & Next-Generation SOC Platform',
    voiceText: 'Greetings. We are Saksham AI — an enterprise autonomous DevSecOps and offensive penetration testing platform. We eliminate weeks of manual auditing and noisy scanner alert fatigue. Our architecture scales horizontally by decoupling a high-throughput stateless REST API gateway from asynchronous background scanning workers, streaming live telemetry via sub-millisecond WebSockets. At our core is an autonomous eight-stage pipeline: Reconnaissance, AST JavaScript Bundle Crawling, Technology Profiling, Security Header Auditing, Live Evidence Verification, Neural Threat Triaging, CVSS v3.1 Mathematical Scoring, and Automated Hotpatch Synthesis. Our threat engine is fine-tuned on CVE, CWE, and OWASP benchmark corpora, synthesizing verified developer code fixes in seconds. Let us proceed through the walkthrough.',
    description: 'Saksham AI replaces legacy manual audits and noisy scanners with an autonomous 8-Stage Assessment Pipeline and a fine-tuned Neural Threat Engine trained on CVE, CWE, and OWASP corpora for non-destructive, zero-downtime security validation.',
    targetSelector: null,
    isCenterModal: true,
    isOverviewStep: true,
    icon: ShieldCheck,
    hint: 'Take this 1-minute guided walkthrough to explore our scalable security pipeline.'
  },
  {
    id: 'start-scan',
    title: 'The 8-Stage Pipeline & Target Ingestion ⚡',
    subtitle: 'Non-Destructive Probing · Zero Downtime Architecture',
    voiceText: 'Click on the highlighted Start Assessment button. Enter your target API endpoint, custom bearer tokens, or paste raw cURL commands. The platform initiates our autonomous eight-stage pipeline with non-destructive, rate-limited HTTP probes to guarantee zero production downtime.',
    description: 'Enter any REST or GraphQL endpoint, or paste raw cURL commands with bearer tokens. Our non-destructive probing engine runs with strict concurrency bounds and timeout guardrails, ensuring 100% production uptime while initiating the 8-stage pipeline.',
    targetSelector: '[data-tour="start-scan"]',
    isCenterModal: false,
    icon: Zap,
    actionTip: 'Non-Destructive Guarantee: Benign probe vectors and rate-limited HTTP pools ensure zero production disruption.',
    showBeacon: true,
    hasActionBtn: true,
    actionBtnLabel: 'Open Scan Wizard Demo →'
  },
  {
    id: 'analysis-hub',
    title: 'Scalable API Architecture & Live Telemetry 🔬',
    subtitle: 'Decoupled Node.js Workers · AST Lexical JavaScript Crawler',
    voiceText: 'This central analysis hub visualizes your attack surface in real time. Our architecture decouples the stateless Express API gateway from asynchronous scanning workers, scaling horizontally across hundreds of targets. The AST crawler parses compiled JavaScript bundles to uncover hidden shadow APIs, streaming telemetry via sub-millisecond WebSockets into this live hub.',
    description: 'Enterprise scalability: Our stateless Express gateway pushes scan jobs to asynchronous worker queues with strict MongoDB state tracking. Cheerio AST lexical parsing extracts obscured client-side routes, while Socket.io streams live stage transitions in real-time.',
    targetSelector: '[data-tour="analysis-hub"]',
    isCenterModal: false,
    icon: Radar,
    actionTip: 'Deep AST Parser: Discovers hidden API routes inside compiled client-side JavaScript bundles that traditional scanners miss.'
  },
  {
    id: 'metric-cards',
    title: 'Verified Posture & Mathematical CVSS Scoring 📊',
    subtitle: 'Algorithmic Risk Formula · 0% False Positives',
    voiceText: 'These metric cards display your true organizational security posture. Unlike legacy tools that flood analysts with hundreds of unverified warnings, our mathematical CVSS v3.1 matrix calculates a score from 0 to 100 based strictly on verified, reproducible HTTP evidence.',
    description: 'Zero Alert Fatigue: Every vulnerability finding carries deterministic HTTP request-response evidence. Severity points (Critical -25, High -15, Medium -8, Low -3) calculate an objective 0–100 score, separating speculative noise from verified risks.',
    targetSelector: '[data-tour="metric-cards"]',
    isCenterModal: false,
    icon: CheckCircle2,
    actionTip: '3-Tier RBAC: Enforces Admin, Analyst, and Viewer governance for enterprise team safety.'
  },
  {
    id: 'navigation',
    title: 'Neural Threat Engine & Drop-In Code Patches 📑',
    subtitle: 'Fine-Tuned on 250,000+ CVEs & CWE-1000 · Slashes MTTR',
    voiceText: 'In the Findings tab, our specialized Neural Threat Engine delivers drop-in code patches tailored for Express, Helmet, and Nginx. This slashes Mean Time to Remediation from weeks to minutes. You can also export tamper-evident vector PDF reports. You are now ready to run your first security assessment.',
    description: 'Closing the loop: Security no longer dumps 200-page vague PDFs. Our specialized neural engine—fine-tuned on CVE/CWE datasets and secure coding patterns—generates exact code snippets ready to copy-paste. Download executive PDF compliance reports in one click.',
    targetSelector: '[data-tour="nav-tabs"]',
    isCenterModal: false,
    icon: FileCode,
    actionTip: 'Slashing developer remediation time by 95% with ready-to-merge patches!'
  }
];

const PIPELINE_STAGES = [
  { num: '01', title: 'Reconnaissance', desc: 'DNS, TLS 1.3 handshakes, WAF & CDN fingerprinting', icon: Globe },
  { num: '02', title: 'AST Bundle Crawler', desc: 'Lexical parsing of client JS to unmask shadow APIs', icon: FileCode },
  { num: '03', title: 'Tech Fingerprinting', desc: 'Full-stack profiling: Express, React, Vite, Nginx', icon: Layers },
  { num: '04', title: 'Header & Policy Audit', desc: 'CSP, CORS, HSTS & Cookie flag inspection', icon: Lock },
  { num: '05', title: 'Live Evidence Verification', desc: 'Deterministic HTTP proofs — 0% false positives', icon: Zap },
  { num: '06', title: 'Neural Threat Engine', desc: 'Fine-tuned contextual triaging on CVE/CWE data', icon: Sparkles },
  { num: '07', title: 'CVSS v3.1 Scoring', desc: 'Objective 0–100 mathematical risk deductions', icon: Activity },
  { num: '08', title: 'Hotpatch Synthesis', desc: 'Ready-to-merge Express/Nginx code fixes & PDFs', icon: FileText },
];

// Strict check to filter out British English voices
const isBritishVoice = (v) => {
  const lang = (v?.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (v?.name || '').toLowerCase();
  return (
    lang.includes('en-gb') ||
    lang.includes('en-uk') ||
    name.includes('united kingdom') ||
    name.includes('great britain') ||
    name.includes('british') ||
    name.includes('george') ||
    name.includes('hazel') ||
    name.includes('susan') ||
    name.includes('uk english') ||
    name.includes('oliver') ||
    name.includes('stephanie')
  );
};

// Strict check to select American or Indian English voices
const isAmericanOrIndianVoice = (v) => {
  if (isBritishVoice(v)) return false;
  const lang = (v?.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (v?.name || '').toLowerCase();

  const isUS =
    lang === 'en-us' ||
    lang.startsWith('en-us') ||
    name.includes('united states') ||
    name.includes('us english') ||
    name.includes('david') ||
    name.includes('mark') ||
    name.includes('zira') ||
    name.includes('guy') ||
    name.includes('aria') ||
    name.includes('alex') ||
    name.includes('google us');

  const isIN =
    lang === 'en-in' ||
    lang.startsWith('en-in') ||
    name.includes('india') ||
    name.includes('ravi') ||
    name.includes('heera') ||
    name.includes('neerja') ||
    name.includes('prabhat') ||
    name.includes('google english (india)');

  return isUS || isIN;
};

export function OnboardingTour({ forceOpen = false, onClose }) {
  const { user, markTourCompleted } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const keepAliveRef = useRef(null);
  const isCancelledRef = useRef(false);
  const isOpenRef = useRef(false);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const userIdentifier = user?.id || user?._id || user?.email || null;
  const storageKey = `saksham_tour_completed_${userIdentifier || 'guest'}`;

  // Keep isOpenRef strictly in sync with isOpen state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Instantly halts all speech synthesis, active utterances, and pending timeouts
  const stopAllSpeech = useCallback(() => {
    isCancelledRef.current = true;
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
  }, []);

  // Ensure speech synthesis stops on component unmount or tab close
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, [stopAllSpeech]);

  // Configure Natural & Reliable Voice: American or Indian English (NEVER British)
  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. Natural named American or Indian voices
    const naturalChoice = voices.find((v) => {
      if (isBritishVoice(v)) return false;
      const n = (v.name || '').toLowerCase();
      return (
        n.includes('david') ||
        n.includes('mark') ||
        n.includes('ravi') ||
        n.includes('heera') ||
        n.includes('neerja') ||
        n.includes('google us') ||
        n.includes('google english (india)') ||
        n.includes('guy') ||
        n.includes('aria')
      );
    });

    // 2. Any local/offline American or Indian voice
    const localChoice = voices.find((v) => v.localService && isAmericanOrIndianVoice(v));

    // 3. Any American or Indian voice
    const anyUSorIN = voices.find((v) => isAmericanOrIndianVoice(v));

    // 4. Any English voice that is NOT British
    const anyNonBritish = voices.find((v) => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('en') && !isBritishVoice(v);
    });

    const chosen = naturalChoice || localChoice || anyUSorIN || anyNonBritish;
    if (chosen) {
      setSelectedVoice(chosen);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  // First-time login detection & auto-show
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }

    // Only auto-open if user is loaded and hasn't seen the tour before
    if (!userIdentifier) return;

    const completedLocal = localStorage.getItem(storageKey);
    const completedServer = user?.hasSeenTour;

    // Only auto-show popup if it is strictly the user's first time
    if (!completedLocal && !completedServer) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [userIdentifier, user?.hasSeenTour, storageKey, forceOpen]);

  // Clean, audible voice narration with instant cancellation guard
  const speakText = useCallback(
    (text) => {
      stopAllSpeech();
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!voiceEnabled || !isOpenRef.current) return;

      isCancelledRef.current = false;

      try {
        playCyberSound('click');

        speechTimeoutRef.current = setTimeout(() => {
          if (!voiceEnabled || isCancelledRef.current || !isOpenRef.current) return;

          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.15;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Ensure American or Indian English voice and language tag (Never British)
            if (selectedVoice) {
              utterance.voice = selectedVoice;
              const vLang = (selectedVoice.lang || '').toLowerCase();
              if (vLang.startsWith('en-in')) {
                utterance.lang = 'en-IN';
              } else {
                utterance.lang = 'en-US';
              }
            } else {
              utterance.lang = 'en-US';
            }

            utterance.onstart = () => {
              if (isCancelledRef.current || !isOpenRef.current) {
                try { window.speechSynthesis.cancel(); } catch (e) {}
                return;
              }
              setIsSpeaking(true);
            };

            utterance.onend = () => {
              if (keepAliveRef.current) {
                clearInterval(keepAliveRef.current);
                keepAliveRef.current = null;
              }
              setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
              if (keepAliveRef.current) {
                clearInterval(keepAliveRef.current);
                keepAliveRef.current = null;
              }
              setIsSpeaking(false);
              // CRITICAL: NEVER play fallback if intentionally cancelled or stopped!
              if (
                isCancelledRef.current ||
                !isOpenRef.current ||
                event?.error === 'canceled' ||
                event?.error === 'interrupted'
              ) {
                return;
              }
            };

            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);

            // Keep-alive for Chromium long utterances
            keepAliveRef.current = setInterval(() => {
              if (!window.speechSynthesis.speaking) {
                if (keepAliveRef.current) clearInterval(keepAliveRef.current);
              } else {
                try {
                  window.speechSynthesis.pause();
                  window.speechSynthesis.resume();
                } catch (e) {}
              }
            }, 8000);
          } catch (err) {
            setIsSpeaking(false);
          }
        }, 50);
      } catch (e) {
        setIsSpeaking(false);
      }
    },
    [voiceEnabled, selectedVoice, stopAllSpeech]
  );

  // Update target element bounding box
  const updateTargetRect = useCallback(() => {
    const currentStepObj = TOUR_STEPS[currentStep];
    if (!currentStepObj || !currentStepObj.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStepObj.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      stopAllSpeech();
      return;
    }

    updateTargetRect();
    const currentTourStep = TOUR_STEPS[currentStep];
    if (voiceEnabled && currentTourStep?.voiceText) {
      speakText(currentTourStep.voiceText);
    }

    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      // Immediate cancellation when transitioning between steps or unmounting
      stopAllSpeech();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen, currentStep, voiceEnabled, updateTargetRect, speakText, stopAllSpeech]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    stopAllSpeech();
    try { playCyberSound('click'); } catch (e) {}
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    stopAllSpeech();
    try { playCyberSound('click'); } catch (e) {}
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    stopAllSpeech();
    if (userIdentifier) {
      localStorage.setItem(`saksham_tour_completed_${userIdentifier}`, 'true');
    }
    localStorage.setItem('saksham_tour_completed_guest', 'true');
    if (markTourCompleted) {
      markTourCompleted();
    }
    setIsOpen(false);
    try { playCyberSound('toast'); } catch (e) {}
    if (onClose) onClose();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopAllSpeech();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      const currentTourStep = TOUR_STEPS[currentStep];
      if (currentTourStep?.voiceText) {
        setTimeout(() => speakText(currentTourStep.voiceText), 30);
      }
    }
  };

  const playOrReplayVoice = () => {
    setVoiceEnabled(true);
    const currentTourStep = TOUR_STEPS[currentStep];
    if (currentTourStep?.voiceText) {
      speakText(currentTourStep.voiceText);
    }
  };

  const handleActionClick = () => {
    handleClose();
    window.dispatchEvent(new CustomEvent('saksham:open-scan-modal'));
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] pointer-events-auto">
        {/* Dark Dimmed Mask with SVG Cutout */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none transition-all duration-300">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - window.scrollX - 8}
                  y={targetRect.top - window.scrollY - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(5, 10, 24, 0.65)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Pulsing Highlight Box around target element */}
        {targetRect && (
          <div
            style={{
              top: targetRect.top - window.scrollY - 8,
              left: targetRect.left - window.scrollX - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            className="absolute pointer-events-none rounded-2xl border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8),inset_0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 z-10"
          >
            {/* Animated Pulsing Beacon on element */}
            {step.showBeacon && (
              <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-80" />
                <span className="relative inline-flex h-5 w-5 rounded-full bg-cyan-500 shadow-xl border-2 border-white" />
              </div>
            )}
          </div>
        )}

        {/* Smart Docking Container: Step 0 is Center Modal; Steps 1-4 are Docked Bottom-Right so Central Hub is 100% UNBLOCKED! */}
        <div
          className={
            step.isCenterModal
              ? 'fixed inset-0 flex items-center justify-center p-3 sm:p-4 pointer-events-none z-[100000]'
              : 'fixed bottom-5 right-5 z-[100000] max-w-lg w-full p-2 sm:p-0 pointer-events-none'
          }
        >
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`pointer-events-auto w-full ${
              step.isCenterModal
                ? 'max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-2xl border-2 border-cyan-500/60 bg-slate-950/98 shadow-[0_24px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(6,182,212,0.3)]'
                : 'max-w-lg p-5 rounded-2xl border-2 border-cyan-500/50 bg-slate-950/95 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.25)]'
            } backdrop-blur-2xl text-slate-100 relative`}
          >
            {/* Arrow Callout Hint when targeting Start Assessment */}
            {step.id === 'start-scan' && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/80 px-3 py-2 text-xs font-mono font-bold text-cyan-300 animate-bounce">
                <ArrowUp size={16} className="text-cyan-400" />
                <span>LOOK ABOVE: Click the highlighted "START ASSESSMENT" button!</span>
              </div>
            )}

            {/* Top Bar: Progress & Voice Assistant Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
                  <Compass size={15} />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Saksham DevSecOps Tour · Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  title="Close Guide (Esc)"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            {step.isOverviewStep ? (
              /* Rich Step 0 Overview: Who We Are, What We Do, 8-Stage Pipeline & Scalable Architecture */
              <div className="space-y-4">
                {/* Header Badge & Title */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>Enterprise Autonomous DevSecOps Platform</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* 8-Stage Pipeline Visual Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Workflow size={14} /> The Autonomous 8-Stage Execution Pipeline
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">Under 3 Minutes · Zero Downtime</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PIPELINE_STAGES.map((s) => {
                      const StageIcon = s.icon;
                      return (
                        <div
                          key={s.num}
                          className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 hover:border-cyan-500/50 hover:bg-slate-900 transition flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              {s.num}
                            </span>
                            <StageIcon size={14} className="text-slate-400 group-hover:text-cyan-300 transition" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                              {s.title}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-snug mt-1 line-clamp-2">
                              {s.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scalable API Architecture & Fine-Tuned Threat Engine */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                      <Server size={14} />
                      <span>Scalable API Architecture</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Stateless Express REST gateway decoupled from asynchronous worker queues. Sub-millisecond Socket.io WebSocket streaming eliminates polling latency while scaling horizontally across enterprise workloads.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400">
                      <Cpu size={14} />
                      <span>Fine-Tuned Threat Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Proprietary neural model trained on 250,000+ CVE vulnerability records, CWE-1000 taxonomies, and OWASP benchmark suites. Synthesizes drop-in code patches with zero hallucinations.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Targeted Steps 1-4 */
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-inner">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                      {step.title}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-400">{step.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">
                  {step.description}
                </p>

                {/* Action Tip Banner */}
                {step.actionTip && (
                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-2.5 text-[11px] text-blue-200 flex items-center gap-2 font-mono">
                    <Sparkles size={14} className="text-cyan-400 shrink-0" />
                    <span>{step.actionTip}</span>
                  </div>
                )}

                {/* Direct Action Trigger inside the tour card */}
                {step.hasActionBtn && (
                  <button
                    type="button"
                    onClick={handleActionClick}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-2 font-mono text-xs font-bold text-white shadow-[0_4px_16px_rgba(6,182,212,0.4)] hover:brightness-110 transition active:scale-95"
                  >
                    <Zap size={14} className="fill-current text-white" />
                    <span>{step.actionBtnLabel}</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Skip
                </button>

                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-[0_4px_16px_rgba(6,182,212,0.4)] hover:brightness-110 transition"
                >
                  <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStep === TOUR_STEPS.length - 1 ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
