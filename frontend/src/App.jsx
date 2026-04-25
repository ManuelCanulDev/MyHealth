import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import EmergencyAction from './components/EmergencyAction';
import ProfileView from './components/ProfileView';
import RegisterForm from './components/RegisterForm';
import ActivityView from './components/ActivityView';
import MonitoringMap from './components/MonitoringMap';
import { Activity, User, Home, History, Map as MapIcon, Globe } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, emergency, profile, register, monitoring, public-profile
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [autoScan, setAutoScan] = useState(false);
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [publicContractAddress, setPublicContractAddress] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    
    if (params.get('scan') === 'true') {
      setActiveTab('emergency');
      setAutoScan(true);
    } else if (pathname.startsWith('/paciente')) {
      const address = pathname.split('/paciente/')[1] || pathname.split('/paciente')[1];
      if (address && address.length > 2) {
        setPublicContractAddress(address);
        setActiveTab('public-profile');
        setPublicProfileData(null); // Force ProfileView to load from contractAddress
      } else {
        // No address provided in URL, use default from .env
        const defaultAddress = import.meta.env.VITE_DEFAULT_CONTRACT_ADDRESS || "0x88a935692Dbf2704aB5EF855fD6C9bfa9c38129D";
        setPublicContractAddress(defaultAddress);
        setActiveTab('public-profile');
        setPublicProfileData(null);
        window.history.replaceState({}, '', `/paciente/${defaultAddress}`);
      }
    }
  }, []);

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    setIsRegistered(true);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-myhealth-blue selection:text-white pb-24">
      <header className="p-6 flex justify-between items-center bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <button onClick={() => { setActiveTab('home'); window.history.pushState({}, '', '/'); }} className="flex items-center gap-2">
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

      <main className="max-w-7xl mx-auto min-h-[calc(100-160px)] px-4 md:px-8">
        {activeTab === 'home' && (
          <LandingPage 
            onStartEmergency={() => setActiveTab('emergency')} 
            onStartRegister={() => setActiveTab('register')} 
          />
        )}

        {activeTab === 'public-profile' && (
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl text-center space-y-2">
              <Globe size={24} className="text-amber-500 mx-auto" />
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em]">Vista Pública de solo lectura</p>
              <p className="text-xs font-bold text-amber-800">Cualquier cambio requiere autorización firmada por el titular.</p>
            </div>
            <ProfileView data={publicProfileData} contractAddress={publicContractAddress} />
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Central de <span className="text-myhealth-blue">Monitoreo</span></h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Geolocalización inmutable en tiempo real</p>
            </div>
            <MonitoringMap />
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 w-full">
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
              <div className="text-center py-12 space-y-6 max-w-sm mx-auto">
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
              <ProfileView data={userData} onTabChange={setActiveTab} />
            )}
          </div>
        )}

        {activeTab === 'register' && (
          <div className="p-6 max-w-2xl mx-auto">
            <RegisterForm onComplete={handleRegistrationComplete} />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 p-4 flex justify-around items-center max-w-md mx-auto md:max-w-3xl md:bottom-6 md:rounded-full md:shadow-2xl md:border md:border-slate-200 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[32px]">
        <button onClick={() => { setActiveTab('home'); window.history.pushState({}, '', '/'); }} className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${activeTab === 'home' ? 'text-myhealth-red scale-110' : 'text-slate-300'}`}>
          <Home size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Inicio</span>
        </button>

        <button onClick={() => { setActiveTab('monitoring'); window.history.pushState({}, '', '/'); }} className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${activeTab === 'monitoring' ? 'text-myhealth-blue scale-110' : 'text-slate-300'}`}>
          <MapIcon size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Mapa</span>
        </button>

        <button onClick={() => { setActiveTab('emergency'); window.history.pushState({}, '', '/'); }} className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${activeTab === 'emergency' ? 'text-myhealth-red scale-110' : 'text-slate-300'}`}>
          <Activity size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Rescate</span>
        </button>

        <button 
          onClick={() => {
            const defaultAddress = import.meta.env.VITE_DEFAULT_CONTRACT_ADDRESS || "0x88a935692Dbf2704aB5EF855fD6C9bfa9c38129D";
            setPublicProfileData(null);
            setPublicContractAddress(defaultAddress);
            setActiveTab('public-profile');
            window.history.pushState({}, '', `/paciente/${defaultAddress}`);
          }} 
          className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${activeTab === 'public-profile' ? 'text-amber-500 scale-110' : 'text-slate-300'}`}
        >
          <Globe size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Paciente</span>
        </button>

        <button onClick={() => { setActiveTab('profile'); window.history.pushState({}, '', '/'); }} className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${['profile', 'register'].includes(activeTab) ? 'text-myhealth-blue scale-110' : 'text-slate-300'}`}>
          <User size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Mi Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;

