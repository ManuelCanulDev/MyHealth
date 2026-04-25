import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import EmergencyAction from './components/EmergencyAction';
import ProfileView from './components/ProfileView';
import RegisterForm from './components/RegisterForm';
import ActivityView from './components/ActivityView';
import { Activity, User, Home, History } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, emergency, profile, register, activity
  const [isRegistered, setIsRegistered] = useState(false);
  const [autoScan, setAutoScan] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scan') === 'true') {
      setActiveTab('emergency');
      setAutoScan(true);
    }
  }, []);

  const handleRegistrationComplete = () => {
    setIsRegistered(true);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-myhealth-blue selection:text-white pb-24">
      <header className="p-6 flex justify-between items-center bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <button onClick={() => setActiveTab('home')} className="flex items-center gap-2">
          <div className="bg-myhealth-red p-1.5 rounded-lg shadow-lg shadow-red-200">
            <Activity className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic">
            MY<span className="text-myhealth-red">HEALTH</span>
          </h1>
        </button>
        
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">Monad Testnet</span>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {activeTab === 'home' && (
          <LandingPage 
            onStartEmergency={() => setActiveTab('emergency')} 
            onStartRegister={() => setActiveTab('register')} 
          />
        )}

        {activeTab === 'emergency' && (
          <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black leading-none tracking-tight uppercase italic text-slate-800">
                Modo <span className="text-myhealth-red">Rescate</span>
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                Uso exclusivo para personal médico
              </p>
            </div>
            <EmergencyAction autoStart={autoScan} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            {!isRegistered ? (
              <div className="text-center py-12 space-y-6">
                <div className="bg-slate-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center text-slate-400">
                  <User size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Sin Perfil Activo</h3>
                  <p className="text-slate-500 text-sm font-medium px-8 leading-relaxed">No has vinculado un brazalete MyHealth todavía.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('register')}
                  className="bg-myhealth-blue text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-transform"
                >
                  Obtener mi Pasaporte
                </button>
              </div>
            ) : (
              <ProfileView />
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <ActivityView />
          </div>
        )}

        {activeTab === 'register' && (
          <div className="p-6">
            <RegisterForm onComplete={handleRegistrationComplete} />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 p-4 flex justify-around items-center max-w-md mx-auto z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[32px]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-myhealth-red scale-110' : 'text-slate-300'}`}>
          <Home size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Inicio</span>
        </button>

        <button onClick={() => setActiveTab('emergency')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'emergency' ? 'text-myhealth-red scale-110' : 'text-slate-300'}`}>
          <Activity size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Rescate</span>
        </button>

        <button onClick={() => setActiveTab('activity')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'activity' ? 'text-myhealth-blue scale-110' : 'text-slate-300'}`}>
          <History size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Bitácora</span>
        </button>

        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${['profile', 'register'].includes(activeTab) ? 'text-myhealth-blue scale-110' : 'text-slate-300'}`}>
          <User size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
