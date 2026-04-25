import React from 'react';
import { Activity, ShieldCheck, Zap, Globe, ArrowRight, Heart, Smartphone } from 'lucide-react';

const LandingPage = ({ onStartEmergency, onStartRegister }) => {
  return (
    <div className="bg-white text-slate-900 animate-in fade-in duration-700">
      {/* Hero Section para Adultos Mayores */}
      <section className="px-6 pt-10 pb-12 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xs md:max-w-md mx-auto mb-8 md:mb-0 relative order-1 md:order-2">
            {/* Contenedor de Imagen con estilo amigable */}
            <div className="rounded-[40px] overflow-hidden border-8 border-white shadow-2xl rotate-2 aspect-[4/5] bg-slate-200">
              <img 
                src="/assets/hero-senior.png" 
                alt="Adulto mayor seguro con MyHealth" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?auto=format&fit=crop&q=80&w=400"; }} // Fallback por si no has subido la imagen
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-myhealth-red text-white p-4 rounded-3xl shadow-xl -rotate-3">
              <Heart className="fill-white" size={24} />
            </div>
          </div>

          <div className="text-center md:text-left space-y-6 order-2 md:order-1">
            <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tight text-slate-800">
              TRANQUILIDAD <br />
              <span className="text-myhealth-blue italic text-3xl md:text-5xl">PARA TU FAMILIA</span>
            </h1>
            
            <p className="text-slate-600 text-base md:text-xl font-medium leading-relaxed px-2 md:px-0 max-w-lg">
              El brazalete inteligente que habla por ti cuando más lo necesitas. Fácil, seguro y sin complicaciones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={onStartRegister}
                className="bg-myhealth-blue text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-transform text-lg"
              >
                Crear mi Pasaporte
              </button>
              <button 
                onClick={onStartEmergency}
                className="bg-white text-slate-800 border-2 border-slate-100 px-8 py-5 rounded-3xl font-black uppercase tracking-widest shadow-sm active:scale-95 transition-transform text-lg md:hidden"
              >
                Escanear Paciente
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Protección Médica Digital Monad
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Confianza - Lenguaje Sencillo */}
      <section className="px-8 py-16 w-full grid md:grid-cols-2 gap-12">
        <div className="flex items-start gap-5">
          <div className="bg-amber-100 p-4 rounded-2xl text-amber-600 shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-black uppercase tracking-tight text-slate-800 text-lg">Tus datos están seguros</h3>
            <p className="text-base text-slate-500 leading-snug">
              Nadie puede ver tu historial sin tu autorización. Es como una caja fuerte digital protegida por la tecnología de Monad.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-5">
          <div className="bg-red-100 p-4 rounded-2xl text-myhealth-red shrink-0">
            <Activity size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-black uppercase tracking-tight text-slate-800 text-lg">Atención más rápida</h3>
            <p className="text-base text-slate-500 leading-snug">
              Los doctores sabrán tus alergias y tipo de sangre al instante para darte el mejor cuidado en situaciones críticas.
            </p>
          </div>
        </div>
      </section>

      {/* Banner de Ayuda Directa */}
      <section className="mx-6 mb-20 p-8 md:p-16 bg-slate-900 rounded-[40px] text-white text-center md:text-left space-y-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-1/4 -translate-y-1/4">
          <Globe size={300} />
        </div>
        
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase leading-none">
            ¿ERES PERSONAL <br className="hidden md:block" /> DE RESCATE?
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Acceso inmediato a protocolos de emergencia</p>
        </div>

        <button 
          onClick={onStartEmergency}
          className="bg-myhealth-red hover:bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase text-sm tracking-widest relative z-10 transition-colors shadow-2xl shadow-red-500/20"
        >
          Escanear Paciente
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
