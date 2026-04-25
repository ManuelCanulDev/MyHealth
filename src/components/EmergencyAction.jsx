import React, { useState } from 'react';
import { ShieldAlert, MapPin, Cpu, CheckCircle2, AlertCircle, Lock, Unlock, History } from 'lucide-react';

const EmergencyAction = () => {
  const [step, setStep] = useState('idle'); // idle, scanning, loading, success
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [location, setLocation] = useState(null);
  
  // Datos simulados por niveles
  const [basicData, setBasicData] = useState(null);
  const [fullHistory, setFullHistory] = useState(null);

  // --- PLACEHOLDERS PARA EL EQUIPO ---

  const fetchBasicData = async (id) => {
    // Simula llamada rápida a la blockchain para datos vitales
    return new Promise(r => setTimeout(() => r({
      name: "JUAN PÉREZ",
      bloodType: "O+",
      criticalAllergy: "Penicilina",
      contact: { name: "María (Esposa)", phone: "+52 33 1234 5678" }
    }), 1500));
  };

  const fetchFullHistory = async (id, pinCode) => {
    // Simula llamada a Laravel/Monad con autorización
    return new Promise(r => setTimeout(() => r([
      { date: "2024-10-12", event: "Cirugía de Apéndice", hospital: "Hospital Civil" },
      { date: "2023-05-20", event: "Diagnóstico: Hipertensión", doctor: "Dr. Arreola" },
      { date: "2022-01-15", event: "Fractura de fémur", treatment: "Placa de titanio" }
    ]), 1000));
  };

  // --- LÓGICA ---

  const handleStartScan = () => {
    setStep('scanning');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        
        // SIMULACIÓN: Envío de Alerta SOS al Backend (Laravel)
        console.log("ALERT: Enviando coordenadas SOS al servidor...", coords);
        
        setTimeout(async () => {
          setStep('loading');
          const data = await fetchBasicData("nfc_001");
          setBasicData(data);
          setStep('success');
        }, 1000);
      }, (err) => {
        alert("Error de GPS: Se requiere ubicación para notificar a emergencias.");
        setStep('idle');
      });
    }
  };

  const handleAuthorize = async () => {
    if (pin === '1234') { // PIN de prueba
      const history = await fetchFullHistory("nfc_001", pin);
      setFullHistory(history);
      setIsAuthorized(true);
    } else {
      alert("PIN Incorrecto - Acceso Denegado");
    }
  };

  if (step === 'idle') return (
    <button onClick={handleStartScan} className="w-full bg-mihealth-red text-white py-12 rounded-3xl shadow-2xl flex flex-col items-center gap-4 active:scale-95 transition-transform">
      <Cpu size={56} className="animate-pulse" />
      <span className="text-2xl font-black italic tracking-tighter uppercase">Escanear Brazalete NFC</span>
    </button>
  );

  if (step === 'scanning' || step === 'loading') return (
    <div className="w-full bg-slate-900 text-white p-12 rounded-[40px] border-2 border-mihealth-blue overflow-hidden relative flex flex-col items-center gap-8 shadow-2xl shadow-blue-900/20">
      {/* Efecto de Radar */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-mihealth-blue rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-4 border-2 border-mihealth-blue rounded-full animate-ping opacity-40 [animation-delay:500ms]"></div>
        <div className="absolute inset-0 border-t-4 border-mihealth-blue rounded-full animate-spin"></div>
        <Cpu size={48} className="text-mihealth-blue relative z-10" />
      </div>

      <div className="text-center space-y-2 relative z-10">
        <p className="text-xl font-black italic uppercase tracking-tighter">
          {step === 'scanning' ? 'Buscando NFC...' : 'Validando Monad...'}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-mihealth-blue rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-mihealth-blue rounded-full animate-bounce [animation-delay:200ms]"></div>
          <div className="w-1.5 h-1.5 bg-mihealth-blue rounded-full animate-bounce [animation-delay:400ms]"></div>
        </div>
      </div>

      {/* Grid de fondo decorativo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      {/* NIVEL 1: FICHA VITAL */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-100">
        <div className="bg-mihealth-red p-4 text-white flex justify-between items-center">
          <span className="font-black italic tracking-widest text-sm">DATOS DE EMERGENCIA</span>
          <CheckCircle2 size={20} />
        </div>
        
        <div className="p-6">
          <h2 className="text-4xl font-black text-slate-900 mb-6">{basicData?.name}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Sangre</p>
              <p className="text-4xl font-black text-mihealth-red">{basicData?.bloodType}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-[10px] font-bold text-red-400 uppercase">Alergia Crítica</p>
              <p className="text-lg font-black text-red-700 uppercase leading-none mt-1">{basicData?.criticalAllergy}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Contacto SOS</p>
              <p className="font-bold">{basicData?.contact.name}</p>
            </div>
            <a href={`tel:${basicData?.contact.phone}`} className="bg-mihealth-blue p-3 rounded-xl hover:bg-blue-600 transition-colors">
              LLAMAR
            </a>
          </div>
        </div>
      </div>

      {/* NIVEL 2: HISTORIAL CLÍNICO (PROTEGIDO) */}
      <div className="bg-slate-100 rounded-3xl p-6 border-2 border-dashed border-slate-300">
        {!isAuthorized ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
              <Lock size={20} />
              <p className="font-bold text-sm uppercase">Historial Clínico Protegido</p>
            </div>
            <p className="text-xs text-slate-500">Se requiere el PIN del paciente o autorización biométrica para acceder al historial completo en la Blockchain.</p>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="Introducir PIN" 
                className="flex-1 p-4 rounded-xl border-2 border-slate-200 focus:border-mihealth-blue outline-none font-bold text-center"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button 
                onClick={handleAuthorize}
                className="bg-slate-800 text-white px-6 rounded-xl font-bold active:scale-95 transition-transform"
              >
                DESBLOQUEAR
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-700">
            <div className="flex items-center gap-3 text-green-600 mb-4">
              <Unlock size={20} />
              <p className="font-bold text-sm uppercase">Acceso Autorizado</p>
            </div>
            <div className="space-y-3">
              {fullHistory?.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-mihealth-blue">
                  <p className="text-[10px] font-bold text-slate-400">{item.date}</p>
                  <p className="font-bold text-slate-800">{item.event}</p>
                  <p className="text-xs text-slate-500">{item.hospital || item.doctor || item.treatment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => window.location.reload()} className="w-full text-slate-400 font-bold text-sm py-4">
        FINALIZAR SESIÓN
      </button>
    </div>
  );
};

export default EmergencyAction;
