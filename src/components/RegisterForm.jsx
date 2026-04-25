import React, { useState } from 'react';
import { User, Droplet, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, Cpu } from 'lucide-react';

const RegisterForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodType: '',
    allergies: '',
    emergencyContact: ''
  });
  const [isMinting, setIsMinting] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = async () => {
    setIsMinting(true);
    // Simulación de interacción con Monad Smart Contract
    console.log("Minteando Pasaporte de Salud en Monad...", formData);
    await new Promise(r => setTimeout(r, 3000));
    setIsMinting(false);
    onComplete();
  };

  const inputStyle = "w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-mihealth-blue outline-none transition-all font-medium text-slate-700 bg-white shadow-sm";
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest";

  if (isMinting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in duration-500">
        <div className="relative">
          <Cpu size={80} className="text-mihealth-blue animate-spin duration-[3000ms]" />
          <div className="absolute inset-0 border-4 border-mihealth-blue rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase">Creando Identidad Digital</h3>
          <p className="text-slate-500 text-sm font-medium max-w-[250px]">
            Registrando tus datos médicos en la Bóveda de Monad Blockchain...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 animate-in slide-in-from-bottom-8 duration-500">
      {/* Indicador de Pasos */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-mihealth-blue' : 'bg-slate-100'}`}></div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Datos Personales</h2>
            <p className="text-slate-400 text-xs font-bold uppercase">Información de identificación</p>
          </header>
          
          <div>
            <label className={labelStyle}>Nombre Completo</label>
            <input 
              type="text" 
              className={inputStyle} 
              placeholder="Ej. Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className={labelStyle}>Teléfono de contacto</label>
            <input 
              type="tel" 
              className={inputStyle} 
              placeholder="+52 33 ..."
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <button 
            onClick={handleNext}
            disabled={!formData.name}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform mt-4"
          >
            Siguiente <ArrowRight size={20} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Ficha Médica</h2>
            <p className="text-slate-400 text-xs font-bold uppercase">Vital para emergencias</p>
          </header>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Tipo de Sangre</label>
              <select 
                className={inputStyle}
                value={formData.bloodType}
                onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
              >
                <option value="">Selecciona</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
              </select>
            </div>
            <div className="flex items-center justify-center bg-red-50 rounded-2xl border-2 border-red-100">
              <Droplet className="text-mihealth-red" size={32} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Alergias Críticas</label>
            <textarea 
              className={inputStyle} 
              placeholder="Ej. Penicilina, Nueces..."
              rows="3"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest">
              Atrás
            </button>
            <button 
              onClick={handleNext}
              className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Siguiente <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <ShieldAlert size={40} />
          </div>
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Finalizar Registro</h2>
            <p className="text-slate-500 text-sm font-medium">Tus datos serán cifrados y vinculados a tu cuenta Monad.</p>
          </header>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resumen del Perfil</span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{formData.name}</p>
            <p className="text-sm font-bold text-mihealth-red uppercase">Sangre {formData.bloodType}</p>
          </div>

          <button 
            onClick={handleFinish}
            className="w-full bg-mihealth-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-transform"
          >
            VINCULAR BRAZALETE
          </button>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed px-4">
            Al registrarte, aceptas que el personal médico acceda a tus datos vitales en caso de emergencia.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
