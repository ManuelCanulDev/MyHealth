import React, { useState } from 'react';
import { ShieldAlert, MapPin, Cpu, CheckCircle2, AlertCircle, Droplet, Phone, FileText, Lock, Unlock, Heart, Hash } from 'lucide-react';
import ActivityView from './ActivityView';

const EmergencyAction = () => {
  const [step, setStep] = useState('idle'); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [location, setLocation] = useState(null);
  const [basicData, setBasicData] = useState(null);

  const fetchFullData = async (id) => {
    return {
      name: "JUAN PÉREZ",
      bloodType: "O+",
      allergies: "Penicilina",
      nss: "1234-56-7890",
      religion: "Católico",
      chronicDisease: "Diabetes Tipo 2",
      baseMedication: "Metformina / Insulina",
      isDonor: true,
      history: "Cirugía de Apéndice (2024), Tratamiento Hipertensión desde 2023.",
      contacts: [
        { name: "María (Esposa)", phone: "+52 33 1234 5678", email: "maria@example.com", relation: "Esposa", active: true },
        { name: "Carlos (Hijo)", phone: "+52 33 8765 4321", email: "carlos@example.com", relation: "Hijo", active: true }
      ]
    };
  };

  const handleStartScan = () => {
    setStep('scanning');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (err) => {
        console.warn("GPS Requerido para protocolizar el rescate");
      });
    }

    // Simulación de 4 segundos en total
    setTimeout(() => {
      setStep('loading'); // Cambia a "Validando..."
      
      setTimeout(async () => {
        const data = await fetchFullData("nfc_001");
        setBasicData(data);
        setStep('success');
      }, 2000); // Otros 2 segundos validando
    }, 2000); // 2 segundos buscando
  };

  const handleAuthorize = () => {
    if (pin === '1234') { 
      setIsAuthorized(true);
    } else {
      alert("PIN Incorrecto");
    }
  };

  // --- RENDERIZADO CONDICIONAL ---
  if (step === 'idle') {
    return (
      <div className="max-w-2xl mx-auto w-full">
        <button onClick={handleStartScan} className="w-full bg-myhealth-red text-white py-12 rounded-[40px] shadow-2xl shadow-red-200 flex flex-col items-center gap-4 active:scale-95 transition-all">
          <Cpu size={56} className="animate-pulse" />
          <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">Escanear Brazalete NFC</span>
        </button>
      </div>
    );
  }

  if (step === 'scanning' || step === 'loading') {
    return (
      <div className="max-w-2xl mx-auto w-full bg-slate-50 p-12 rounded-[40px] border-2 border-myhealth-blue overflow-hidden relative flex flex-col items-center gap-8 shadow-xl">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-myhealth-blue rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 border-t-4 border-myhealth-blue rounded-full animate-spin"></div>
          <Cpu size={48} className="text-myhealth-blue relative z-10" />
        </div>
        <p className="text-xl font-black italic uppercase tracking-tighter text-center text-slate-800">
          {step === 'scanning' ? 'Buscando NFC...' : 'NFC detectado, validando informacion...'}
        </p>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL (SUCCESS) ---
  return (
    <div className="w-full space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-10">
      <div className="grid md:grid-cols-2 gap-8 w-full">
        
        {/* COLUMNA IZQUIERDA: FICHA VITAL */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex-1 flex flex-col">
            <div className="bg-myhealth-red p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="font-black italic tracking-widest text-[10px]">PROTOCOLO DE EMERGENCIA ACTIVO</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-[8px] font-bold uppercase">En vivo</span>
              </div>
            </div>
            
            <div className="p-8 space-y-8 flex-1 flex flex-col justify-center">
              {/* Identificación con Foto y Datos Pro - Rediseñado para no cortarse */}
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative shrink-0">
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-2xl bg-slate-200 mx-auto">
                    <img 
                      src="/assets/patient-photo.png" 
                      alt="Foto del paciente" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"; }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-none italic uppercase tracking-tighter break-words">{basicData?.name}</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">Expediente Monad Blockchain</p>
                  </div>

                  <div className="bg-slate-50 p-4 md:p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center max-w-sm mx-auto">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                      <Hash size={10}/> Número de Seguro Social
                    </p>
                    <span className="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-widest block leading-none">
                      {basicData?.nss}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Grid de Datos Críticos - 2x2 para darles espacio */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
                <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Droplet size={12} className="text-myhealth-red" /> Sangre
                  </p>
                  <p className="text-4xl md:text-5xl font-black text-myhealth-red leading-none">{basicData?.bloodType}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Heart size={12} className="text-myhealth-red" /> Donante
                  </p>
                  <p className={`text-sm md:text-lg font-black uppercase leading-tight ${basicData?.isDonor ? 'text-green-600' : 'text-slate-800'}`}>
                    {basicData?.isDonor ? 'SÍ, ACTIVO' : 'NO'}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Religión</p>
                  <p className="text-sm md:text-lg font-black text-slate-800 uppercase leading-tight">{basicData?.religion}</p>
                </div>
                <div className="bg-red-600 p-6 rounded-[32px] shadow-lg shadow-red-200 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-black text-red-100 uppercase tracking-widest mb-2">Alergias Críticas</p>
                  <p className="text-sm md:text-lg font-black text-white uppercase leading-tight">{basicData?.allergies}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SEGURIDAD Y CONTACTOS */}
        <div className="space-y-8 flex flex-col h-full">
          {/* CONTACTOS SOS COMPACTOS (AHORA ARRIBA) */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <Phone size={14} className="text-myhealth-red" /> Contactos de Auxilio
            </h4>
            <div className="space-y-4">
              {basicData?.contacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-myhealth-blue transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-myhealth-blue/10 text-myhealth-blue rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0">
                       <Phone size={20} />
                     </div>
                     <div>
                       <p className="text-sm font-black text-slate-800 uppercase leading-tight">{contact.name}</p>
                       <p className="text-[11px] font-bold text-myhealth-blue mt-0.5">{contact.phone}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1">{contact.relation}</p>
                     </div>
                  </div>
                  <a href={`tel:${contact.phone}`} className="bg-white text-myhealth-blue p-4 rounded-2xl shadow-lg border border-slate-100 hover:bg-myhealth-blue hover:text-white transition-all shrink-0">
                    <Phone size={18} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* BÓVEDA PROTEGIDA (AHORA ABAJO) */}
          <div className="bg-white rounded-[40px] p-8 border-2 border-slate-100 shadow-xl overflow-hidden relative min-h-[350px] flex flex-col justify-center flex-1">
            {!isAuthorized ? (
              <div className="space-y-8 text-center animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-blue-50 rounded-[32px] flex items-center justify-center text-myhealth-blue border-2 border-blue-100 shadow-inner">
                    <Lock size={40} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-2xl leading-none">Bóveda Médica</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Requiere PIN del paciente</p>
                  </div>
                </div>
                <div className="space-y-4 max-w-xs mx-auto">
                  <input 
                    type="password" 
                    maxLength="4"
                    placeholder="****" 
                    className="w-full p-6 rounded-[32px] border-2 border-slate-100 outline-none font-black text-center text-5xl tracking-[0.6em] bg-slate-50/50 text-slate-800 focus:border-myhealth-blue transition-all pr-0 pl-[0.6em]"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  />
                  <button onClick={handleAuthorize} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all">
                    Desbloquear Historial
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                    <Unlock size={14} /> Acceso de Emergencia Autorizado
                  </div>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest mb-3">
                      <FileText size={14} className="text-myhealth-blue" /> Historial Clínico Completo
                    </p>
                    <div className="bg-blue-50 p-6 rounded-[32px] text-slate-700 text-sm font-semibold border border-blue-100 leading-relaxed shadow-inner">
                      {basicData?.history}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Condición</p>
                      <p className="text-slate-800 text-xs font-black uppercase italic leading-tight">{basicData?.chronicDisease}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Medicación</p>
                      <p className="text-myhealth-blue text-xs font-black leading-tight uppercase italic">{basicData?.baseMedication}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t border-slate-100 mt-8">
        <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-100">
          <MapPin size={16} className="text-slate-400" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incidente registrado en: 20.6736° N, 103.3440° W</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all">
          Finalizar Sesión de Rescate
        </button>
      </div>
    </div>
  );
};

export default EmergencyAction;
