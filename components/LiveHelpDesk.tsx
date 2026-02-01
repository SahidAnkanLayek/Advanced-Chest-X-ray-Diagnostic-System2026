
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, MicOff, Volume2, Loader2, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

interface LiveHelpDeskProps {
  onClose: () => void;
}

const LiveHelpDesk: React.FC<LiveHelpDeskProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<{user: string, ai: string}[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Audio decoding helpers
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const encodePCM = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  useEffect(() => {
    const initLiveSession = async () => {
      try {
        // 1. Initialize Audio Contexts
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx({ sampleRate: 16000 });
        outAudioContextRef.current = new AudioCtx({ sampleRate: 24000 });

        // 2. Resume contexts (Crucial for Localhost/Chrome autoplay policy)
        if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
        if (outAudioContextRef.current.state === 'suspended') await outAudioContextRef.current.resume();
        
        // 3. Request Microphone
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        // 4. Connect to Gemini Live API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are the CheXNet-AI Help Desk Agent. You assist radiologists and technicians with using this Chest X-ray analysis platform. You can explain findings like Atelectasis or Cardiomegaly, guide them to the 'Report History' tab, or explain how Grad-CAM heatmaps work. Be professional, concise, and always mention that you are an AI assistant.",
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {}
          },
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              setIsListening(true);
              const source = audioContextRef.current!.createMediaStreamSource(stream);
              const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                sessionPromise.then(session => {
                  if (session) {
                    session.sendRealtimeInput({
                      media: { data: encodePCM(inputData), mimeType: 'audio/pcm;rate=16000' }
                    });
                  }
                });
              };
              
              source.connect(processor);
              processor.connect(audioContextRef.current!.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
              // Handle Transcriptions
              if (msg.serverContent?.inputTranscription) {
                setCurrentInput(prev => prev + msg.serverContent!.inputTranscription!.text);
              }
              if (msg.serverContent?.outputTranscription) {
                setCurrentOutput(prev => prev + msg.serverContent!.outputTranscription!.text);
              }
              if (msg.serverContent?.turnComplete) {
                setTranscription(prev => [...prev, { user: currentInput, ai: currentOutput }].slice(-3));
                setCurrentInput("");
                setCurrentOutput("");
              }

              // Handle Audio Output
              const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioBase64 && outAudioContextRef.current) {
                const ctx = outAudioContextRef.current;
                // Ensure output context is running
                if (ctx.state === 'suspended') await ctx.resume();
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decodeBase64(audioBase64), ctx);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }

              if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => {
                  try { s.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onclose: () => setIsConnected(false),
            onerror: (e) => {
              console.error("Live Help Error:", e);
              setError("Connection interrupted. Please check your network and API key.");
            }
          }
        });
        
        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        console.error("Failed to start Live Help Desk:", err);
        setError(err.message || "Microphone access denied or connection failed.");
      }
    };

    initLiveSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outAudioContextRef.current) outAudioContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/10 text-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Live AI Help Desk</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {isConnected ? 'Connected • Audio Link Active' : 'Establishing Connection...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-4">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold">Help Desk Unavailable</p>
                <p className="text-slate-500 text-xs mt-1">{error}</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                Retry Connection
              </button>
            </div>
          ) : !isConnected ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="text-blue-500 animate-spin" size={48} />
              <p className="text-slate-500 text-sm animate-pulse font-medium">Initializing Neural Audio Link...</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] text-center">Ensure your microphone is connected and allowed in browser settings.</p>
            </div>
          ) : (
            <>
              {/* Visualizer */}
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-1.5 h-16">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 bg-blue-500 rounded-full animate-bounce`}
                      style={{ 
                        height: `${20 + Math.random() * 80}%`, 
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Transcription Area */}
              <div className="space-y-4">
                {transcription.map((t, i) => (
                  <div key={i} className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-xs max-w-[85%] shadow-sm">
                        {t.user}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-2xl rounded-tl-none text-xs max-w-[85%] shadow-sm border border-slate-200 dark:border-slate-700">
                        {t.ai}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Live Real-time lines */}
                {currentInput && (
                  <div className="flex justify-end opacity-70">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-tr-none text-xs italic">
                      {currentInput}...
                    </div>
                  </div>
                )}
                {currentOutput && (
                  <div className="flex justify-start opacity-70">
                    <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-2xl rounded-tl-none text-xs italic">
                      {currentOutput}...
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Control */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              {isListening && isConnected ? <Mic className="text-blue-500 animate-pulse" size={16} /> : <MicOff size={16} />}
              <span className="text-xs font-medium">{isListening && isConnected ? 'Listening for your voice...' : 'Neural Link Inactive'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <ShieldCheck className="text-green-500" size={14} />
              <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">Medical Grade AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveHelpDesk;
