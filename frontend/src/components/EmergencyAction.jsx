import React, { useState } from 'react';
import { ShieldAlert, MapPin, Cpu, CheckCircle2, AlertCircle, Droplet, Phone, FileText, Lock, Unlock, Heart, Hash } from 'lucide-react';
import ActivityView from './ActivityView';

import { getMedicalRecord, triggerEmergencyAlert } from '../api';

const EmergencyAction = () => {
  const [step, setStep] = useState('idle'); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [location, setLocation] = useState(null);
  const [basicData, setBasicData] = useState(null);
  const [error, setError] = useState(null);
  const [testContract, setTestContract] = useState('');

  const handleStartScan = (forcedAddress = null) => {
    const contractAddress = forcedAddress || testContract || "nfc_001";
    
    setStep('scanning');
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        // Opcional: enviar alerta automática al detectar NFC
        // triggerEmergencyAlert(contractAddress, loc, "Escaneo de emergencia iniciado");
      }, (err) => {
        console.warn("GPS Requerido para protocolizar el rescate");
      });
    }

    setTimeout(() => {
      setStep('loading'); 
      
      setTimeout(async () => {
        try {
          const data = await getMedicalRecord(contractAddress);
          // Adaptar datos del API al formato del componente
          const formattedData = {
            name: `${data.perfilNombre || ''} ${data.perfilApellido || ''}`.trim() || "PACIENTE DESCONOCIDO",
            bloodType: data.tipoSangre || "N/A",
            allergies: data.alergias || "Ninguna registrada",
            nss: data.numeroSeguroSocial || "No disponible",
            religion: data.religion || "No especificada",
            chronicDisease: data.condiciones || "Ninguna registrada",
            baseMedication: data.medicacion || "Sin medicación",
            isDonor: data.esDonante === true || data.esDonante === "true",
            history: data.notaEmergencia || "Sin notas adicionales",
            contacts: data.contactos || []
          };
          setBasicData(formattedData);
          setStep('success');
        } catch (e) {
          console.error(e);
          setError(e.message);
          setStep('idle');
        }
      }, 2000);
    }, 2000);
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
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        
        <button onClick={() => handleStartScan()} className="w-full bg-myhealth-red text-white py-12 rounded-[40px] shadow-2xl shadow-red-200 flex flex-col items-center gap-4 active:scale-95 transition-all">
          <Cpu size={56} className="animate-pulse" />
          <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">Escanear Brazalete NFC</span>
        </button>

        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-200 space-y-3">
          <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">Modo Desarrollador / Pruebas</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Dirección del Contrato (0x...)" 
              className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-myhealth-blue transition-colors"
              value={testContract}
              onChange={(e) => setTestContract(e.target.value)}
            />
            <button 
              onClick={() => handleStartScan()}
              className="bg-slate-900 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter"
            >
              Cargar
            </button>
          </div>
        </div>
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
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* ALERTA CRÍTICA - CABECERA CON FOTO */}
      <div className="bg-red-600 text-white p-8 rounded-t-[40px] flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-inner">
        <div className="relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl bg-white/20">
            <img 
              src="/assets/patient-photo.png" 
              alt="Foto del paciente" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"; }}
            />
          </div>
        </div>
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <CheckCircle2 size={18} className="text-red-200" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-200">Identidad Confirmada</p>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{basicData?.name}</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 bg-white rounded-b-[40px] shadow-2xl overflow-hidden border-2 border-red-600">
        
        {/* BLOQUE 1: DATOS VITALES (LO MÁS IMPORTANTE) */}
        <div className="p-8 space-y-8 border-b md:border-b-0 md:border-r border-slate-100">
          
          <div className="flex items-center justify-between gap-6 bg-red-50 p-8 rounded-[32px] border-2 border-red-200">
            <div className="space-y-1">
              <p className="text-sm font-black text-red-600 uppercase">Tipo de Sangre</p>
              <p className="text-7xl md:text-9xl font-black text-red-600 leading-none">{basicData?.bloodType}</p>
            </div>
            <Droplet size={80} className="text-red-600 opacity-20" />
          </div>

          <div className={`p-8 rounded-[32px] border-4 ${basicData?.allergies ? 'border-red-600 bg-red-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            <p className={`text-sm font-black uppercase mb-2 ${basicData?.allergies ? 'text-red-100' : 'text-slate-400'}`}>Alergias Críticas</p>
            <p className="text-3xl md:text-5xl font-black leading-tight uppercase">
              {basicData?.allergies || 'Ninguna registrada'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-[32px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Donante</p>
              <p className="text-2xl font-black uppercase">{basicData?.isDonor ? 'SÍ' : 'NO'}</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-[32px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Seguro Social</p>
              <p className="text-xl font-black text-slate-800">{basicData?.nss}</p>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: CONTACTOS Y MÁS INFO */}
        <div className="p-8 space-y-8 bg-slate-50/50">
          
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Phone size={18} className="text-red-600" /> Llamar a familiares
            </h4>
            {basicData?.contacts.map((contact, i) => (
              <a 
                key={i} 
                href={`tel:${contact.phone}`} 
                className="flex items-center justify-between p-6 bg-white rounded-[32px] border-2 border-slate-200 shadow-md active:scale-95 transition-all hover:border-myhealth-blue"
              >
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-900 uppercase">{contact.name}</p>
                  <p className="text-lg font-bold text-myhealth-blue">{contact.phone}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">{contact.relation}</p>
                </div>
                <div className="bg-red-600 text-white p-5 rounded-2xl shadow-lg shadow-red-200">
                  <Phone size={32} />
                </div>
              </a>
            ))}
          </div>

          {/* ACCESO A BÓVEDA (DISCRETO PERO ACCESIBLE) */}
          {!isAuthorized ? (
            <div className="p-8 bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-center space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">¿Necesitas historial médico completo?</p>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  maxLength="4"
                  placeholder="PIN" 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 text-center text-2xl font-black tracking-[0.5em] focus:border-myhealth-blue outline-none"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                />
                <button onClick={handleAuthorize} className="bg-slate-900 text-white px-6 rounded-2xl font-black uppercase text-xs">
                  OK
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-top-4 p-8 bg-blue-600 text-white rounded-[32px] shadow-xl space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-blue-200">Historial Médico Desbloqueado</p>
              <p className="text-xl font-bold leading-relaxed">{basicData?.history}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500">
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-200">Enfermedades</p>
                  <p className="text-sm font-black">{basicData?.chronicDisease}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-200">Medicación</p>
                  <p className="text-sm font-black">{basicData?.baseMedication}</p>
                </div>
              </div>
            </div>
          )}

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
