import React, { useState } from 'react';
import { ShieldAlert, MapPin, Cpu, CheckCircle2, AlertCircle, Lock, Unlock, History, Droplet, Phone } from 'lucide-react';

const EmergencyAction = () => {
  const [step, setStep] = useState('idle'); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [location, setLocation] = useState(null);
  
  const [basicData, setBasicData] = useState(null);
  const [fullHistory, setFullHistory] = useState(null);

  const fetchBasicData = async (id) => {
    return new Promise(r => setTimeout(() => r({
      name: "JUAN PÉREZ",
      bloodType: "O+",
      criticalAllergy: "Penicilina",
      nss: "1234-56-7890",
      religion: "Católico",
      chronicDisease: "Diabetes Tipo 2",
      baseMedication: "Metformina / Insulina",
      isDonor: "SÍ, DONADOR",
      contacts: [
        { name: "María (Esposa)", phone: "+52 33 1234 5678" },
        { name: "Carlos (Hijo)", phone: "+52 33 8765 4321" }
      ]
    }), 1500));
  };

  const fetchFullHistory = async (id, pinCode) => {
    return new Promise(r => setTimeout(() => r([
      { date: "2024-10-12", event: "Cirugía de Apéndice", hospital: "Hospital Civil" },
      { date: "2023-05-20", event: "Diagnóstico: Hipertensión", doctor: "Dr. Arreola" }
    ]), 1000));
  };

  const handleStartScan = () => {
    setStep('scanning');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setTimeout(async () => {
          setStep('loading');
          const data = await fetchBasicData("nfc_001");
          setBasicData(data);
          setStep('success');
        }, 1000);
      }, (err) => {
        alert("GPS Requerido");
        setStep('idle');
      });
    }
  };

  const handleAuthorize = async () => {
    if (pin === '1234') {
      const history = await fetchFullHistory("nfc_001", pin);
      setFullHistory(history);
      setIsAuthorized(true);
    } else {
      alert("PIN Incorrecto");
    }
  };

  if (step === 'idle') return (
    <button onClick={handleStartScan} className="w-full bg-myhealth-red text-white py-12 rounded-[40px] shadow-2xl shadow-red-200 flex flex-col items-center gap-4 active:scale-95 transition-all">
      <Cpu size={56} className="animate-pulse" />
      <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">Escanear Brazalete NFC</span>
    </button>
  );

  if (step === 'scanning' || step === 'loading') return (
    <div className="w-full bg-slate-50 p-12 rounded-[40px] border-2 border-myhealth-blue overflow-hidden relative flex flex-col items-center gap-8 shadow-xl">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-myhealth-blue rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 border-t-4 border-myhealth-blue rounded-full animate-spin"></div>
        <Cpu size={48} className="text-myhealth-blue relative z-10" />
      </div>
      <p className="text-xl font-black italic uppercase tracking-tighter text-center text-slate-800">
        {step === 'scanning' ? 'Buscando NFC...' : 'Validando Monad...'}
      </p>
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-10">
      {/* FICHA VITAL HOMOGÉNEA */}
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-myhealth-red p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="font-black italic tracking-widest text-[10px]">FICHA MÉDICA DE EMERGENCIA</span>
          </div>
          <CheckCircle2 size={16} />
        </div>
        
        <div className="p-6 space-y-6">
          {/* Identificación con Foto */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-200">
                <img 
                  src="/assets/patient-photo.png" 
                  alt="Foto del paciente" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"; }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white w-6 h-6 rounded-full shadow-sm"></div>
            </div>
            
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-none italic uppercase tracking-tighter">{basicData?.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                 <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">NSS: {basicData?.nss}</span>
              </div>
            </div>
          </div>
          
          {/* Datos Críticos en Grid Homogéneo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Droplet size={10} className="text-myhealth-red" /> Sangre
              </p>
              <p className="text-3xl font-black text-slate-800 leading-none">{basicData?.bloodType}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Alergias</p>
              <p className="text-sm font-black text-red-600 uppercase leading-tight truncate">{basicData?.criticalAllergy}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Religión</p>
              <p className="text-xs font-bold text-slate-700">{basicData?.religion}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Donador</p>
              <p className="text-xs font-bold text-slate-700">{basicData?.isDonor}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Información Crítica</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Enfermedad:</span>
                <span className="text-xs font-black text-slate-800 uppercase italic">{basicData?.chronicDisease}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Medicación:</span>
                <span className="text-xs font-black text-myhealth-blue text-right leading-tight max-w-[150px]">{basicData?.baseMedication}</span>
              </div>
            </div>
          </div>

          {/* Contactos de Emergencia (Doble Contacto) */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Contactos de Auxilio</p>
            {basicData?.contacts.map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-myhealth-blue/10 rounded-full flex items-center justify-center text-myhealth-blue">
                     <Phone size={18} />
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-800 leading-tight">{contact.name}</p>
                     <p className="text-[11px] font-bold text-slate-400">{contact.phone}</p>
                   </div>
                </div>
                <a href={`tel:${contact.phone}`} className="bg-myhealth-blue text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-transform">
                  <Phone size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HISTORIAL PROTEGIDO (Nivel 2) */}
      <div className="bg-slate-50 rounded-[40px] p-8 border-2 border-dashed border-slate-200">
        {!isAuthorized ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-3 opacity-60">
              <Lock size={32} className="text-slate-400" />
              <h4 className="font-black text-slate-400 uppercase italic tracking-tighter text-lg leading-none">Historial Privado</h4>
            </div>
            <div className="space-y-3">
              <input 
                type="password" 
                placeholder="Introducir PIN" 
                className="w-full p-5 rounded-[24px] border-2 border-slate-100 outline-none font-bold text-center text-lg bg-white shadow-sm focus:border-myhealth-blue transition-all"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button onClick={handleAuthorize} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                Acceder a la Bóveda
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest mb-4">
              <Unlock size={14} /> Historial Sincronizado
            </div>
            <div className="space-y-2">
              {fullHistory?.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{item.date}</p>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{item.event}</p>
                  <p className="text-[10px] text-slate-500 italic mt-1">{item.hospital || item.doctor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => window.location.reload()} className="w-full text-slate-300 font-bold text-[10px] uppercase tracking-widest py-4">
        Cerrar Sesión de Rescate
      </button>
    </div>
  );
};

export default EmergencyAction;
