import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, CreditCard, ChevronRight, Settings, Bell, Eye, Lock, Unlock, FileText, Activity, History } from 'lucide-react';
import ActivityView from './ActivityView';

const ProfileView = ({ data, onTabChange }) => {
  const [showVault, setShowVault] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [userData] = useState({
    name: data?.name || "Juan Pérez",
    nfcId: data?.nfcId || "MH-8829-01X",
    bloodType: data?.bloodType || "O+",
    criticalAllergy: data?.chronicDisease || "Ninguna registrada",
    vaultData: {
      history: data?.vaultData?.history || ["Perfil creado el " + new Date().toLocaleDateString()],
      medications: [data?.baseMedication || "Sin medicación"],
      lastCheckup: data?.vaultData?.lastCheckup || new Date().toLocaleDateString()
    },
    contacts: [
      { 
        name: data?.contact1Name || "María García", 
        phone: data?.contact1Phone || "+52 33 1234 5678",
        relation: "Contacto Principal"
      }
    ]
  });

  const handleSettings = () => {
    alert("Ajustes: Próximamente podrás editar tu perfil y configurar permisos.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* HEADER DEL PERFIL CON FOTO */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200">
            <img 
              src="/assets/patient-photo.png" 
              alt="Tu foto de perfil" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"; }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-myhealth-blue border-2 border-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">{userData.name}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identidad Blockchain Activa</p>
        </div>
      </div>

      {/* SECCIÓN 1: PERFIL DE EMERGENCIA (PÚBLICO) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Eye size={14} className="text-myhealth-red" /> Vista de Emergencia (Pública)
          </h3>
          <span className="text-[9px] bg-red-100 text-myhealth-red px-2 py-0.5 rounded-full font-bold">VISIBLE POR RESCATISTAS</span>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-xl border-l-[12px] border-myhealth-red relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Activity size={80} />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">{userData.name}</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Pasaporte de Salud MyHealth</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <CreditCard size={20} className="text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Sangre</p>
                <p className="text-2xl font-black text-myhealth-red leading-none">{userData.bloodType}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                <p className="text-[9px] font-bold text-red-400 uppercase">Alergia</p>
                <p className="text-sm font-black text-red-700 leading-none truncate">{userData.criticalAllergy}</p>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-400 font-medium italic border-t border-slate-100 pt-3">
              * Estos datos se muestran automáticamente al escanear tu brazalete.
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: RED DE APOYO */}
      <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Bell size={14} className="text-myhealth-red" /> Contactos SOS
        </h3>
        {userData.contacts.map((contact, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-myhealth-red/10 rounded-full flex items-center justify-center text-myhealth-red text-xs font-black">
                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{contact.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{contact.relation || 'Contacto'} • SMS Activo</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
        ))}
      </section>

      {/* SECCIÓN 3: BÓVEDA MÉDICA (PRIVADA) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Lock size={14} className="text-myhealth-blue" /> Bóveda de Salud (Privada)
          </h3>
          <ShieldCheck size={16} className="text-myhealth-blue" />
        </div>

        <div className={`bg-white rounded-[40px] transition-all duration-500 border-2 overflow-hidden ${showVault ? 'border-myhealth-blue shadow-lg shadow-blue-100' : 'border-slate-100'}`}>
          {!showVault ? (
            <div className="p-8 space-y-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-myhealth-blue border border-blue-100">
                <Fingerprint size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-slate-900 font-black text-xl italic uppercase tracking-tighter">Bóveda Cifrada</h4>
                <p className="text-slate-500 text-xs px-2 leading-relaxed font-medium">
                  Tu historial clínico y medicación están protegidos con tecnología Monad.
                </p>
              </div>
              <button 
                onClick={() => setShowVault(true)}
                className="w-full bg-myhealth-blue hover:bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                Desbloquear Información
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-myhealth-blue/10 rounded-xl">
                      <Unlock size={18} className="text-myhealth-blue" />
                    </div>
                    <span className="text-slate-900 font-black text-sm uppercase tracking-widest leading-none">Acceso Autorizado</span>
                  </div>
                  <button onClick={() => setShowVault(false)} className="text-[10px] text-slate-400 font-bold uppercase hover:text-slate-900 transition-colors">Cerrar</button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 tracking-widest">
                      <FileText size={10} /> Historial Clínico
                    </p>
                    <div className="space-y-2">
                      {userData.vaultData.history.map((item, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl text-slate-700 text-xs font-semibold border border-slate-100">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Medicinas</p>
                      <p className="text-slate-800 text-xs font-bold">{userData.vaultData.medications[0]}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Última Cita</p>
                      <p className="text-slate-800 text-xs font-bold">{userData.vaultData.lastCheckup}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                  Datos Sincronizados con Monad Blockchain
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* OPCIONES ADICIONALES */}
      <div className="flex gap-4 px-2">
        <button 
          onClick={handleSettings}
          className="flex-1 bg-slate-100 p-4 rounded-2xl text-slate-500 flex flex-col items-center gap-1 transition-colors hover:bg-slate-200 active:scale-95"
        >
          <Settings size={20} />
          <span className="text-[9px] font-black uppercase">Ajustes</span>
        </button>
        <button 
          onClick={() => setShowActivity(!showActivity)}
          className={`flex-1 p-4 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 ${showActivity ? 'bg-myhealth-blue text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <History size={20} />
          <span className="text-[9px] font-black uppercase">Wallet</span>
        </button>
      </div>

      {showActivity && (
        <div className="pt-4 animate-in slide-in-from-bottom-4 duration-500">
          <ActivityView 
            title="Mi Actividad" 
            subtitle="Tus transacciones y accesos recientes" 
          />
        </div>
      )}

    </div>
  );
};

export default ProfileView;
