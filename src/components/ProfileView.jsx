import React, { useState } from 'react';
import { User, ShieldCheck, Fingerprint, CreditCard, ChevronRight, Settings, Bell } from 'lucide-react';

const ProfileView = () => {
  const [userData] = useState({
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    nfcId: "MH-8829-01X",
    wallet: "0x71C...4f92",
    bloodType: "O+",
    status: "Activo"
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header del Perfil */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-mihealth-blue/10 rounded-2xl flex items-center justify-center text-mihealth-blue">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">{userData.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{userData.email}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Identidad Verificada</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Identidad Digital (NFC + Blockchain) */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Fingerprint size={120} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <CreditCard className="text-mihealth-blue" size={32} />
            <span className="bg-mihealth-blue/20 text-mihealth-blue text-[10px] px-3 py-1 rounded-full font-bold border border-mihealth-blue/30 uppercase">
              Monad Pass
            </span>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NFC ID</p>
            <p className="text-xl font-mono font-bold tracking-wider">{userData.nfcId}</p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Address</p>
              <p className="text-xs font-mono text-slate-300">{userData.wallet}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sangre</p>
              <p className="text-2xl font-black text-mihealth-red">{userData.bloodType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Respaldo QR (Plan B) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">Respaldo de Emergencia</h3>
          <p className="text-sm font-bold text-slate-800">Código QR Universal</p>
          <p className="text-[10px] text-slate-400 leading-tight">Usa este código si el lector NFC no es compatible con el dispositivo del rescatista.</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
          <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center p-1 overflow-hidden">
             {/* Simulación de QR con un Grid */}
             <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-80">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`}></div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Red de Apoyo (Contactos de Emergencia) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase text-xs tracking-widest text-slate-400 flex items-center gap-2">
            <Bell size={14} className="text-mihealth-red" /> Red de Apoyo
          </h3>
          <button className="text-[10px] font-bold text-mihealth-blue uppercase tracking-tighter">Editar</button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mihealth-red/10 rounded-full flex items-center justify-center text-mihealth-red text-xs font-bold">MG</div>
              <div>
                <p className="text-sm font-bold text-slate-800">María García</p>
                <p className="text-[10px] text-slate-400 font-medium italic">Esposa • Recibe Alertas SOS</p>
              </div>
            </div>
            <a href="tel:+523312345678" className="p-2 text-slate-400 hover:text-mihealth-blue transition-colors">
              <ChevronRight size={20} />
            </a>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold">JP</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Juan Pérez Jr.</p>
                <p className="text-[10px] text-slate-400 font-medium italic">Hijo</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-200" />
          </div>
        </div>
      </div>

      {/* Menú de Opciones */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Privacidad y PIN</p>
              <p className="text-[10px] text-slate-400">Gestiona quién accede a tu historial</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>

        <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bell size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Notificaciones SOS</p>
              <p className="text-[10px] text-slate-400">Alertas enviadas a tus contactos</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>

        <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Configuración</p>
              <p className="text-[10px] text-slate-400">Idioma, Red Monad y Dispositivos</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>

      {/* Botón de Acción Secundario */}
      <button className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors">
        Actualizar Ficha Médica
      </button>
    </div>
  );
};

export default ProfileView;
