import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Globe,
  ArrowRight,
  Bot,
  ExternalLink,
  MessageSquare,
  Play
} from 'lucide-react';
import aiService from '../../services/aiService';
import { useLanguage } from '../../context/LanguageContext';

export default function AIAssistantWidget() {
  const navigate = useNavigate();
  const { language: currentAppLang, setLanguage: setAppLang, supportedLanguages, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('kn-IN');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am AgriConnect’s voice assistant. Ask about farm jobs, wages, or your applications.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [lastAction, setLastAction] = useState(null);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Sync selected voice language with app language
  useEffect(() => {
    const langObj = supportedLanguages.find((l) => l.code === currentAppLang);
    if (langObj && langObj.speechCode) {
      setSelectedLang(langObj.speechCode);
    }
  }, [currentAppLang, supportedLanguages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // Text-To-Speech (TTS) Voice Synthesis
  const speakText = (text, langCode = selectedLang) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS error:', err);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Initialize Web Speech Recognition
  const handleVoiceToggle = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((previous) => [...previous, {
        sender: 'ai',
        text: 'Voice input is not supported by this browser. Please type your request below.'
      }]);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setMessages((previous) => [...previous, {
          sender: 'ai',
          text: event.error === 'not-allowed'
            ? 'Microphone access was denied. Allow microphone access in your browser settings or type your request.'
            : 'Could not hear your request. Please try again or type it below.'
        }]);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setMessages((previous) => [...previous, {
        sender: 'ai',
        text: 'Could not start voice input. Please type your request below.'
      }]);
    }
  };

  // Process User Query via Backend AI Service (Phase 7 NLP)
  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    // Add User message
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    try {
      const res = await aiService.processVoice(text, selectedLang);
      const data = res.data || {};

      const aiResponseText =
        data.displayText ||
        data.spokenResponse ||
        'Understood your query. Searching AgriConnect marketplace.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponseText,
          action: data.action,
          targetUrl: data.targetUrl,
          intent: data.intent
        }
      ]);

      if (data.targetUrl) {
        setLastAction({
          label: `Open ${data.intent || 'Page'}`,
          targetUrl: data.targetUrl
        });
      }

      // Speak response aloud in user's language
      speakText(aiResponseText, selectedLang);
    } catch (err) {
      console.error('AI processing error:', err);
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: err.message || 'Could not process that request. Please check your connection and try again.'
      }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 90 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="animate-float"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
            border: 'none',
            color: '#070a11',
            padding: '0.85rem 1.4rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.45)'
          }}
        >
          <Sparkles size={20} color="#070a11" />
          <span>{t('voice_assistant', 'AI Voice Assistant')}</span>
        </button>
      )}

      {/* Floating AI Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            width: '390px',
            maxWidth: '92vw',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            background: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '1.4rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.2rem',
              background: 'rgba(16, 185, 129, 0.15)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '0.65rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#070a11'
                }}
              >
                <Bot size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 800 }}>
                  AgriConnect AI
                </h4>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#a3e635',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  <Globe size={13} />
                  <span>Phase 7 Multilingual Voice</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  title="Stop audio readout"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VolumeX size={15} />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div
            style={{
              padding: '0.55rem 1rem',
              background: 'rgba(30, 41, 59, 0.75)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
              🌐 Spoken Language:
            </span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.45rem',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.2rem 0.5rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.speechCode}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background:
                    msg.sender === 'user'
                      ? 'rgba(16, 185, 129, 0.25)'
                      : 'rgba(30, 41, 59, 0.9)',
                  border: `1px solid ${
                    msg.sender === 'user' ? '#10b981' : 'rgba(255, 255, 255, 0.15)'
                  }`,
                  color: '#ffffff',
                  padding: '0.8rem 1.1rem',
                  borderRadius: '1rem',
                  fontSize: '0.88rem',
                  lineHeight: '1.45',
                  fontWeight: 500
                }}
              >
                <div>{msg.text}</div>

                {/* Target Navigation Action Link */}
                {msg.targetUrl && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(msg.targetUrl);
                    }}
                    style={{
                      marginTop: '0.65rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#070a11',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>View / Execute Action</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            ))}

            {isListening && (
              <div
                style={{
                  alignSelf: 'center',
                  background: 'rgba(132, 204, 22, 0.2)',
                  color: '#a3e635',
                  border: '1px dashed #84cc16',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Volume2 size={16} className="animate-pulse" />
                <span>{t('voice_listening', 'Listening in your language...')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Prompt Suggestions */}
          <div
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(15, 23, 42, 0.8)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {[
              '🌾 Wheat Harvesting',
              '🌱 Cotton Jobs',
              '📍 Jobs Near Me',
              '📋 My Applications'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  borderRadius: '9999px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(15, 23, 42, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            {/* Mic Toggle Button */}
            <button
              onClick={handleVoiceToggle}
              style={{
                width: '2.8rem',
                height: '2.8rem',
                borderRadius: '50%',
                background: isListening
                  ? '#ef4444'
                  : 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
                border: 'none',
                color: isListening ? '#ffffff' : '#070a11',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isListening
                  ? '0 0 20px #ef4444'
                  : '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Text Input for Typing Fallback */}
            <input
              type="text"
              placeholder={t('voice_speak_prompt', 'Speak or type in your language...')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.65rem 0.9rem',
                borderRadius: '0.7rem',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              style={{
                width: '2.6rem',
                height: '2.6rem',
                borderRadius: '0.7rem',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
