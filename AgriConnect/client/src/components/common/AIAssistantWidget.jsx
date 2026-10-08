import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2, Globe, ArrowRight, Bot } from 'lucide-react';

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am AgriConnect AI. Speak or type to find nearby farm jobs or workers in your language.'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const languages = [
    { code: 'hi-IN', label: 'हिंदी (Hindi)' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
    { code: 'mr-IN', label: 'मराठी (Marathi)' },
    { code: 'en-US', label: 'English' }
  ];

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is simulated in this browser environment.');
    }

    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      
      const sampleQueries = {
        'kn-IN': [
          'ನನ್ನ ಹತ್ತಿರದ ಭತ್ತದ ಕೊಯ್ಲು ಕೆಲಸ ತೋರಿಸಿ (Show nearby paddy harvesting jobs)',
          '೫ ಜನ ಕೃಷಿ ಕಾರ್ಮಿಕರು ಬೇಕಾಗಿದ್ದಾರೆ (Need 5 farm workers)',
          'ದೈನಂದಿನ ಕೂಲಿ ₹೬೫೦ ಕೆಲಸ ಲಭ್ಯವಿದೆಯೇ? (Is ₹650 daily wage work available?)'
        ],
        'hi-IN': [
          'अनंतपुर में गेहूं की कटाई का काम चाहिए (Search harvesting jobs in Anand)',
          'कपास बीनने के लिए ५ मजदूर चाहिए (Need 5 cotton pickers)'
        ],
        'gu-IN': [
          'નજીકનું ખેત કામ બતાવો (Show nearby farm work)'
        ]
      };

      const langQueries = sampleQueries[selectedLang] || sampleQueries['kn-IN'];
      const query = langQueries[Math.floor(Math.random() * langQueries.length)];
      handleSend(query);
    }, 2500);
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add User message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // AI Processing response matching selected language
    setTimeout(() => {
      let responseText = 'AI Smart Matching: Found 2 high-matching jobs in your area with ₹650/day wage.';
      
      if (selectedLang === 'kn-IN' || text.includes('ಕನ್ನಡ') || text.includes('ಕೆಲಸ') || text.includes('ರೈತ') || text.includes('ಕೊಯ್ಲು')) {
        responseText = 'ಕೃಷಿ ಕನೆಕ್ಟ್ AI: ನಿಮ್ಮ ಹತ್ತಿರದ ಪ್ರದೇಶದಲ್ಲಿ ₹೬೫೦/ದಿನದ ವೇತನದ ೨ ಸೂಕ್ತ ಕೃಷಿ ಕೆಲಸಗಳು ಲಭ್ಯವಿವೆ (ಸುರೇಶ್ ಕುಮಾರ್ ಫಾರ್ಮ್ - ೪ಕಿಮೀ ದೂರ).';
      } else if (selectedLang === 'hi-IN' || text.includes('कपास') || text.includes('काम') || text.includes('मजदूर')) {
        responseText = 'एग्रीकनेक्ट AI: आपके निकटतम क्षेत्र में ₹६५०/दिन मजदूरी के साथ २ उपयुक्त कृषि कार्य उपलब्ध हैं।';
      } else if (selectedLang === 'gu-IN' || text.includes('ખેત') || text.includes('મજૂર')) {
        responseText = 'એગ્રીકનેક્ટ AI: તમારા નજીકના વિસ્તારમાં ₹૬૬૦/દિવસ વેતનવાળા ૨ યોગ્ય ખેત કામ ઉપલબ્ધ છે.';
      } else if (selectedLang === 'ta-IN') {
        responseText = 'அக்ரிகனெக்ட் AI: உங்கள் அருகில் நாள் கூலி ₹650 மதிப்பிலான 2 விவசாய வேலைகள் உள்ளன.';
      } else if (selectedLang === 'te-IN') {
        responseText = 'ఆగ్రికనెక్ట్ AI: మీ సమీపంలో రోజువారీ వేతనం ₹650 తో 2 వ్యవసాయ పనులు అందుబాటులో ఉన్నాయి.';
      } else if (selectedLang === 'mr-IN') {
        responseText = 'ॲग्रीकनेक्ट AI: आपल्या जवळच्या भागात ₹६५०/दिवस मजुरीची २ शेतमजुरीची कामे उपलब्ध आहेत.';
      }

      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
    }, 800);
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
          <span>AI Voice Assistant</span>
        </button>
      )}

      {/* Floating AI Panel */}
      {isOpen && (
        <div className="glass-panel" style={{
          width: '370px',
          maxWidth: '92vw',
          height: '490px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '1.4rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.2rem',
            background: 'rgba(16, 185, 129, 0.15)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Bot size={22} color="#34d399" />
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 800 }}>AgriConnect AI</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#a3e635', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Globe size={13} />
                  <span>Voice & Language Engine</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#ffffff', cursor: 'pointer', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Language Selector */}
          <div style={{ padding: '0.65rem 1rem', background: 'rgba(30, 41, 59, 0.65)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} style={{ background: '#0f172a', color: '#ffffff' }}>
                  🌐 Language: {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.sender === 'user' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.9)',
                border: `1px solid ${msg.sender === 'user' ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                color: '#ffffff',
                padding: '0.8rem 1.1rem',
                borderRadius: '1rem',
                fontSize: '0.9rem',
                lineHeight: '1.45',
                fontWeight: 500
              }}>
                {msg.text}
              </div>
            ))}

            {isListening && (
              <div style={{
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
              }}>
                <Volume2 size={15} className="animate-pulse" />
                <span>Listening in your language...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <button
              onClick={handleVoiceToggle}
              style={{
                width: '2.6rem',
                height: '2.6rem',
                borderRadius: '50%',
                background: isListening ? '#ef4444' : 'rgba(16, 185, 129, 0.2)',
                border: `1px solid ${isListening ? '#ef4444' : '#10b981'}`,
                color: isListening ? '#ffffff' : '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Mic size={19} />
            </button>

            <input
              type="text"
              placeholder="Speak or type your query..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '9999px',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                fontWeight: 500
              }}
            />

            <button
              onClick={() => handleSend()}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: '#10b981',
                border: 'none',
                color: '#070a11',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <ArrowRight size={17} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
