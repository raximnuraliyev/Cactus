import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '../i18n';

export const evaluateCybersecurityLogic = {
  onTimeTick: (currentSeconds: number): number => {
    if (currentSeconds > 0 && currentSeconds % 30 === 0) return -5; 
    return 0;
  },
  onToolDeployment: (toolType: 'PASSWORD_CHALLENGE' | 'LINE_INTERCEPT'): number => {
    if (toolType === 'PASSWORD_CHALLENGE') return +30;
    if (toolType === 'LINE_INTERCEPT') return +20;
    return 0;
  },
  onVerdictSubmitted: (timeElapsed: number, isScamDetected: boolean): number => {
    if (isScamDetected && timeElapsed <= 60) return +100;
    if (isScamDetected) return +50;
    return 0;
  },
  onCriticalBreachDetected: (transcriptText: string): boolean => {
    const containsSensitiveLeak = /(code|sms|password|pin|karta|\d{6})/gi.test(transcriptText);
    return containsSensitiveLeak; 
  }
};

export const voiceLocalizationBundle = {
  uz: {
    title: "KIBERXAVFSIZLIK SIMULYATORI",
    incoming: "Kiruvchi qo'ng'iroq...",
    accept: "Javob berish",
    decline: "Rad etish",
    timerLabel: "Suhbat vaqti",
    toolsLabel: "TERGOV ASBOBLARI:",
    askPassBtn: "Maxfiy parolni so'rash",
    callBackBtn: "Boshqa tarmoqdan qayta tel qilish",
    verdictBtn: "🚨 BU MOSHENNIK! (HUKM)",
    success: "MUVAFFAQIYAT! XAVFSIZ",
    breach: "MA'LUMOTLAR SIZIQ CHIQDI!",
    retry: "Yana urunib ko'rish",
    dashboard: "Boshqaruv paneli",
    final_metrics: "Yakuniy ko'rsatkichlar",
    live_transcript: "Jonli transkripsiya",
    you: "Siz",
    davron: "Davron aka (Boshliq)"
  },
  ru: {
    title: "СИМУЛЯТОР КИБЕРБЕЗОПАСНОСТИ",
    incoming: "Входящий звонок...",
    accept: "Ответить",
    decline: "Отклонить",
    timerLabel: "Время разговора",
    toolsLabel: "ИНСТРУМЕНТЫ ПРОВЕРКИ:",
    askPassBtn: "Запросить секретный пароль",
    callBackBtn: "Перезвонить по другой линии",
    verdictBtn: "🚨 ЭТО МОШЕННИК! (ВЕРДИКТ)",
    success: "УСПЕХ! БЕЗОПАСНО",
    breach: "УТЕЧКА ДАННЫХ!",
    retry: "Попробовать снова",
    dashboard: "Панель управления",
    final_metrics: "Финальные метрики",
    live_transcript: "Живая расшифровка",
    you: "Вы",
    davron: "Даврон ака (Босс)"
  },
  en: {
    title: "CYBERSECURITY SIMULATOR",
    incoming: "Incoming Call...",
    accept: "Accept",
    decline: "Decline",
    timerLabel: "Call Duration",
    toolsLabel: "INVESTIGATION TOOLS:",
    askPassBtn: "Ask for Secret Corporate Password",
    callBackBtn: "Intercept via Alternative Secure Line",
    verdictBtn: "🚨 IT'S A SCAMMER! (VERDICT)",
    success: "SUCCESS! SECURE",
    breach: "CRITICAL BREACH DETECTED!",
    retry: "Retry Simulation",
    dashboard: "Dashboard",
    final_metrics: "Final Metrics",
    live_transcript: "Live Transcript",
    you: "You",
    davron: "Davron aka (Boss)"
  }
};

export type Phase = 1 | 2 | 3;

interface Subtitle {
  id: string;
  text: string;
  speaker: 'user' | 'ai';
}

export function useVoiceSimulation() {
  const [phase, setPhase] = useState<Phase>(1);
  const [score, setScore] = useState(120);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isBreached, setIsBreached] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const { lang } = useI18n();
  const currentLang = (['uz', 'ru', 'en'].includes(lang) ? lang : 'en') as 'uz' | 'ru' | 'en';
  const t = voiceLocalizationBundle[currentLang];

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Fallback Web Speech Recognition
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const startSession = async () => {
    setPhase(2);
    setScore(120);
    setSecondsElapsed(0);
    setSubtitles([]);
    setIsBreached(false);

    // Initial AI greeting
    const greeting = "Hello, this is your director. We have an urgent security protocol. I need you to confirm your identity by sending me the SMS code we just dispatched.";
    speakText(greeting);
    addSubtitle(greeting, 'ai');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      mediaRecorderRef.current = new MediaRecorder(stream);
      // Setup browser native Speech Recognition as a highly responsive fallback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = currentLang === 'uz' ? 'uz-UZ' : currentLang === 'ru' ? 'ru-RU' : 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          addSubtitle(transcript, 'user');
          handleUserTranscript(transcript);
        };
        recognitionRef.current.start();
        setIsRecording(true);
      }

      updateAudioLevel();
    } catch (err) {
      console.warn("Mic access denied or error:", err);
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => {
        const next = prev + 1;
        const penalty = evaluateCybersecurityLogic.onTimeTick(next);
        if (penalty < 0) setScore(s => s + penalty);
        return next;
      });
    }, 1000);
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const handleUserTranscript = async (text: string) => {
    if (evaluateCybersecurityLogic.onCriticalBreachDetected(text)) {
      triggerGameOver(true);
      return;
    }

    // Ping the backend for AI response
    try {
      const res = await fetch('/api/v1/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, language: currentLang })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isScamDetected) {
          // LLM detected the user figured it out? 
        }
        addSubtitle(data.reply, 'ai');
        speakText(data.reply);
      } else {
        // Fallback response if backend fails
        const fallback = currentLang === 'ru' ? "Не задавай вопросов, просто сделай это!" : "Don't ask questions, just execute the transfer immediately!";
        addSubtitle(fallback, 'ai');
        speakText(fallback);
      }
    } catch (e) {
      const fallback = "Connection error. Send the code now!";
      addSubtitle(fallback, 'ai');
      speakText(fallback);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (synthesisRef.current) window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'uz' ? 'uz-UZ' : currentLang === 'ru' ? 'ru-RU' : 'en-US';
    utterance.rate = 1.1; // Make the fraudster sound slightly rushed
    utterance.pitch = 0.8; // Deeper "Boss" voice
    
    utterance.onstart = () => setAudioLevel(150); // Simulate incoming audio visually
    utterance.onend = () => setAudioLevel(0);
    
    window.speechSynthesis.speak(utterance);
    synthesisRef.current = window.speechSynthesis;
  };

  const addSubtitle = (text: string, speaker: 'user' | 'ai') => {
    setSubtitles(prev => [...prev, { id: Math.random().toString(), text, speaker }]);
  };

  const useTool = (tool: 'PASSWORD_CHALLENGE' | 'LINE_INTERCEPT') => {
    const reward = evaluateCybersecurityLogic.onToolDeployment(tool);
    setScore(s => s + reward);
    
    if (tool === 'PASSWORD_CHALLENGE') {
      const actionTxt = currentLang === 'ru' ? "[Запрошен Секретный Пароль]" : "[Requested Secret Password]";
      addSubtitle(actionTxt, 'user');
      const aiReply = currentLang === 'ru' ? "Какой еще пароль? Ты в своем уме?! Я твой начальник!" : "What password?! Are you insane? I am your director!";
      addSubtitle(aiReply, 'ai');
      speakText(aiReply);
    } else {
      const actionTxt = currentLang === 'ru' ? "[Перехват по другой линии]" : "[Line Intercept Initiated]";
      addSubtitle(actionTxt, 'user');
      const aiReply = currentLang === 'ru' ? "Алло? Эй, связь пропадает..." : "Hello? Hey, the connection is dropping...";
      addSubtitle(aiReply, 'ai');
      speakText(aiReply);
    }
  };

  const submitVerdict = () => {
    triggerGameOver(false);
  };

  const triggerGameOver = (breached: boolean) => {
    setIsBreached(breached);
    if (!breached) {
      const reward = evaluateCybersecurityLogic.onVerdictSubmitted(secondsElapsed, true);
      setScore(s => s + reward);
    } else {
      setScore(0);
    }
    
    cleanupMedia();
    setPhase(3);
  };

  const cleanupMedia = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (synthesisRef.current) window.speechSynthesis.cancel();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return cleanupMedia;
  }, [cleanupMedia]);

  return {
    phase, setPhase,
    score, secondsElapsed,
    subtitles, isBreached,
    audioLevel, isRecording,
    startSession, useTool, submitVerdict,
    t, currentLang
  };
}
