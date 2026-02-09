
import React, { useState, useCallback } from 'react';
import { TeacherRole, Message, TutorState, LessonPlan } from './types';
import { TEACHERS } from './constants';
import { GeminiService } from './services/geminiService';
import TeacherAvatar from './components/TeacherAvatar';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [state, setState] = useState<TutorState>({
    currentPhase: 'IDLE',
    activeTeacher: null,
    history: [],
    lessonPlan: null,
  });

  const [isThinking, setIsThinking] = useState(false);

  const addMessage = (role: 'user' | 'model', text: string, teacherRole?: TeacherRole) => {
    setState(prev => ({
      ...prev,
      history: [...prev.history, { role, text, teacherRole, timestamp: Date.now() }]
    }));
  };

  const handleSendMessage = async (userText: string) => {
    if (isThinking) return;

    addMessage('user', userText);
    setIsThinking(true);

    try {
      // PHASE 1: DIAGNOSIS (If first message or early stage)
      if (state.currentPhase === 'IDLE' || state.currentPhase === 'DIAGNOSING') {
        setState(prev => ({ ...prev, currentPhase: 'DIAGNOSING', activeTeacher: TeacherRole.DIAGNOSTICIAN }));
        
        // Check if we have enough context to plan
        if (state.history.length > 2) {
          // Trigger Planning
          await triggerPlanning(userText);
        } else {
          const response = await GeminiService.getDiagnosticResponse(userText, state.history);
          addMessage('model', response || "I'm analyzing your knowledge level. Can you tell me more?", TeacherRole.DIAGNOSTICIAN);
        }
      } 
      // PHASE 2: ACTIVE TEACHING
      else if (state.currentPhase === 'TEACHING') {
        // Standard teacher response during a lesson
        const response = await GeminiService.getDiagnosticResponse(userText, state.history);
        addMessage('model', response || "Let's continue.", TeacherRole.EXPLAINER);
      }

    } catch (error) {
      console.error("Tutor Error:", error);
      addMessage('model', "The faculty is experiencing a brief interruption. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const triggerPlanning = async (topic: string) => {
    setState(prev => ({ ...prev, currentPhase: 'PLANNING', activeTeacher: TeacherRole.ARCHITECT }));
    const plan = await GeminiService.generateLessonPlan(topic);
    
    if (plan) {
      setState(prev => ({ ...prev, lessonPlan: plan }));
      addMessage('model', `I've constructed a custom roadmap for **${plan.topic}**. Here's our path:`, TeacherRole.ARCHITECT);
      
      // Immediately transition to Teaching with the "Critic-Reviewed" lesson
      setState(prev => ({ ...prev, currentPhase: 'TEACHING', activeTeacher: TeacherRole.EXPLAINER }));
      const lesson = await GeminiService.getComprehensiveTeaching(topic, plan);
      addMessage('model', lesson || "I'm ready to start.", TeacherRole.EXPLAINER);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center p-4 md:p-8 selection:bg-indigo-500/30">
      {/* Header */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Omni<span className="text-indigo-500">Tutor</span>
          </h1>
          <p className="text-slate-400 font-medium">Autonomous Multi-Teacher Faculty</p>
        </div>

        {/* Faculty Panel */}
        <div className="flex gap-4 md:gap-8 bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/50">
          {(Object.values(TEACHERS)).map((teacher) => (
            <TeacherAvatar 
              key={teacher.id} 
              teacher={teacher} 
              isActive={state.activeTeacher === teacher.id}
            />
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
        {/* Left: Chat Area */}
        <div className="lg:col-span-8 h-full">
          <ChatInterface 
            messages={state.history} 
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Right: Lesson Plan & Status */}
        <div className="lg:col-span-4 h-full flex flex-col gap-6">
          <div className="bg-slate-900/40 rounded-3xl p-6 shadow-sm border border-slate-800/50 flex-1 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded">📋</span> Active Lesson Plan
            </h3>
            
            {!state.lessonPlan ? (
              <div className="text-slate-500 text-sm italic py-8 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                Diagnostic phase in progress... 
                Once complete, Prof. Lyra will build your plan.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800/50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-lg font-bold text-indigo-400">{state.lessonPlan.topic}</p>
                </div>
                
                <div className="space-y-4">
                  {state.lessonPlan.steps.map((step, idx) => (
                    <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500/60 before:rounded-full">
                      <h4 className="font-bold text-slate-200 text-sm">{step.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{step.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-indigo-950/80 rounded-3xl p-6 shadow-xl text-white border border-indigo-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300 mb-2">Faculty Strategy</h3>
            <p className="text-sm text-indigo-100 leading-relaxed opacity-90">
              {state.activeTeacher 
                ? TEACHERS[state.activeTeacher].description 
                : "The faculty is currently idle. Ask a question to begin a new personalized session."}
            </p>
            {isThinking && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1 bg-indigo-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-1/3 animate-[loading_2s_infinite]"></div>
                </div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase">Self-Optimizing...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default App;
