import React, { useState } from 'react';
import { User, Droplet, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, Cpu, Heart, Phone } from 'lucide-react';

const RegisterForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nss: '',
    bloodType: '',
    religion: '',
    chronicDisease: '',
    baseMedication: '',
    isDonor: 'No',
    contact1Name: '',
    contact1Phone: '',
    contact2Name: '',
    contact2Phone: ''
  });
  const [isMinting, setIsMinting] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = async () => {
    setIsMinting(true);
    console.log("Registrando en Monad...", formData);
    await new Promise(r => setTimeout(r, 3000));
    setIsMinting(false);
    onComplete();
  };

  const inputStyle = "w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-mihealth-blue outline-none transition-all font-medium text-slate-700 bg-white shadow-sm text-sm";
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest";

  if (isMinting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in duration-500">
        <div className="relative">
          <Cpu size={80} className="text-mihealth-blue animate-spin duration-[3000ms]" />
          <div className="absolute inset-0 border-4 border-mihealth-blue rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase">Cifrando Datos</h3>
          <p className="text-slate-500 text-sm font-medium max-w-[250px]">Guardando tu identidad médica en la red de seguridad Monad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 animate-in slide-in-from-bottom-8 duration-500 pb-10">
      {/* Progreso */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-mihealth-blue' : 'bg-slate-100'}`}></div>
        ))}
      </div>

      {/* PASO 1: Identificación */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Identidad</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Información oficial</p>
          </header>
          
          <div>
            <label className={labelStyle}>Nombre Completo</label>
            <input type="text" className={inputStyle} placeholder="Nombre y Apellidos" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Teléfono</label>
              <input type="tel" className={inputStyle} placeholder="Tu número" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>NSS</label>
              <input type="text" className={inputStyle} placeholder="Seguro Social" value={formData.nss} onChange={(e) => setFormData({...formData, nss: e.target.value})} />
            </div>
          </div>

          <button onClick={handleNext} disabled={!formData.name || !formData.nss} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            Siguiente <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* PASO 2: Datos Médicos */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Ficha Médica</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Vital para rescate</p>
          </header>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Sangre</label>
              <select className={inputStyle} value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})}>
                <option value="">Tipo</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="A+">A+</option><option value="A-">A-</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>¿Donador?</label>
              <select className={inputStyle} value={formData.isDonor} onChange={(e) => setFormData({...formData, isDonor: e.target.value})}>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Religión (Opcional)</label>
            <input type="text" className={inputStyle} placeholder="Ej. Católico, Ateo..." value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} />
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelStyle}>Enfermedad Crónica</label>
              <input type="text" className={inputStyle} placeholder="Ej. Diabetes, Hipertensión..." value={formData.chronicDisease} onChange={(e) => setFormData({...formData, chronicDisease: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Medicamento Base</label>
              <input type="text" className={inputStyle} placeholder="Ej. Insulina, Metformina..." value={formData.baseMedication} onChange={(e) => setFormData({...formData, baseMedication: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest">Atrás</button>
            <button onClick={handleNext} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">Siguiente <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {/* PASO 3: Contactos SOS */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Contactos SOS</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">¿A quién avisamos?</p>
          </header>

          <div className="bg-slate-50 p-4 rounded-3xl space-y-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone size={10} /> Contacto Principal</p>
            <input type="text" className={inputStyle} placeholder="Nombre del contacto" value={formData.contact1Name} onChange={(e) => setFormData({...formData, contact1Name: e.target.value})} />
            <input type="tel" className={inputStyle} placeholder="Teléfono" value={formData.contact1Phone} onChange={(e) => setFormData({...formData, contact1Phone: e.target.value})} />
          </div>

          <div className="bg-slate-50 p-4 rounded-3xl space-y-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone size={10} /> Contacto Secundario</p>
            <input type="text" className={inputStyle} placeholder="Nombre (Opcional)" value={formData.contact2Name} onChange={(e) => setFormData({...formData, contact2Name: e.target.value})} />
            <input type="tel" className={inputStyle} placeholder="Teléfono" value={formData.contact2Phone} onChange={(e) => setFormData({...formData, contact2Phone: e.target.value})} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest">Atrás</button>
            <button onClick={handleNext} disabled={!formData.contact1Name || !formData.contact1Phone} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">Siguiente <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {/* PASO 4: Confirmación */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
            <ShieldAlert size={40} />
          </div>
          <header>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Casi Listo</h2>
            <p className="text-slate-500 text-xs mt-2 font-medium">Tus datos serán cifrados y guardados en la Blockchain.</p>
          </header>

          <div className="bg-slate-50 p-5 rounded-3xl text-left border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resumen del Perfil</span>
              <Heart size={14} className="text-mihealth-red fill-mihealth-red" />
            </div>
            <p className="text-xl font-black text-slate-800 leading-tight uppercase italic">{formData.name}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">SANGRE {formData.bloodType}</span>
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">DONADOR: {formData.isDonor}</span>
            </div>
          </div>

          <button onClick={handleFinish} className="w-full bg-mihealth-blue text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
            VINCULAR BRAZALETE
          </button>
          
          <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed px-2">
            Al registrarte, autorizas al personal médico a ver tus datos básicos en caso de emergencia.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
