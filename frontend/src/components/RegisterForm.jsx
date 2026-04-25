import React, { useState } from 'react';
import { User, Droplet, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, Cpu, Heart, Phone, Lock, FileText, Edit2, ShieldCheck } from 'lucide-react';

const RegisterForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nss: '',
    bloodType: '',
    religion: '',
    chronicDisease: '',
    allergies: '',
    baseMedication: '',
    history: '',
    pin: '',
    isDonor: false,
    contact1Name: '',
    contact1Phone: '',
    contact1Relation: '',
    contact1Email: '',
    contact2Name: '',
    contact2Phone: '',
    contact2Relation: '',
    contact2Email: ''
  });
  const [isMinting, setIsMinting] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const goToStep = (s) => setStep(s);

  const handleFinish = async () => {
    if (formData.pin.length !== 4) {
      alert("El PIN debe ser de 4 dígitos");
      return;
    }
    setIsMinting(true);

    const formattedData = {
      name: formData.name,
      phone: formData.phone,
      nss: formData.nss,
      bloodType: formData.bloodType,
      religion: formData.religion,
      chronicDisease: formData.chronicDisease,
      allergies: formData.allergies,
      baseMedication: formData.baseMedication,
      history: formData.history,
      pin: formData.pin,
      isDonor: formData.isDonor,
      contacts: [
        {
          name: formData.contact1Name,
          phone: formData.contact1Phone,
          relation: formData.contact1Relation,
          email: formData.contact1Email,
          active: true
        },
        ...(formData.contact2Name ? [{
          name: formData.contact2Name,
          phone: formData.contact2Phone,
          relation: formData.contact2Relation,
          email: formData.contact2Email,
          active: true
        }] : [])
      ]
    };

    console.log("Registrando en Monad...", formattedData);
    await new Promise(r => setTimeout(r, 3000));
    setIsMinting(false);
    onComplete(formattedData);
  };

  const inputStyle = "w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-myhealth-blue outline-none transition-all font-medium text-slate-700 bg-white shadow-sm text-sm";
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest";

  if (isMinting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in duration-500">
        <div className="relative">
          <Cpu size={80} className="text-myhealth-blue animate-spin duration-[3000ms]" />
          <div className="absolute inset-0 border-4 border-myhealth-blue rounded-full animate-ping opacity-20"></div>
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
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-myhealth-blue' : 'bg-slate-100'}`}></div>
        ))}
      </div>

      {/* PASO 1: Identificación */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Identidad</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Información oficial para tu pasaporte médico</p>
          </header>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelStyle}>Nombre Completo</label>
              <input type="text" className={inputStyle} placeholder="Nombre y Apellidos" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className={labelStyle}>Teléfono de Contacto</label>
              <input type="tel" className={inputStyle} placeholder="Ej. +52 33 1234 5678" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Número de Seguro Social (NSS)</label>
              <input type="text" className={inputStyle} placeholder="Ej. 1234567890" value={formData.nss} onChange={(e) => setFormData({...formData, nss: e.target.value})} />
            </div>
          </div>

          <button onClick={handleNext} disabled={!formData.name || !formData.nss} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 mt-6 hover:bg-slate-800 transition-colors">
            Siguiente Paso <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* PASO 2: Datos Médicos */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Ficha Médica</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Vital para protocolos de rescate</p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelStyle}>Tipo de Sangre</label>
                <select className={inputStyle} value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})}>
                  <option value="">Tipo</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>¿Donador?</label>
                <button 
                  onClick={() => setFormData({...formData, isDonor: !formData.isDonor})}
                  className={`flex-1 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${formData.isDonor ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  {formData.isDonor ? 'Sí, Donante' : 'No'}
                </button>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Religión o Creencias</label>
              <input type="text" className={inputStyle} placeholder="Ej. Católico, Testigo de Jehová..." value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyle}>Alergias Críticas (¡Muy importante!)</label>
              <input type="text" className={inputStyle} placeholder="Ej. Penicilina, Látex, Abejas..." value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} />
            </div>

            <div>
              <label className={labelStyle}>Enfermedad Crónica</label>
              <input type="text" className={inputStyle} placeholder="Ej. Diabetes Tipo 1, Asma..." value={formData.chronicDisease} onChange={(e) => setFormData({...formData, chronicDisease: e.target.value})} />
            </div>
            
            <div>
              <label className={labelStyle}>Medicamento Base</label>
              <input type="text" className={inputStyle} placeholder="Ej. Insulina, Salbutamol..." value={formData.baseMedication} onChange={(e) => setFormData({...formData, baseMedication: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyle}>Breve Historial / Cirugías</label>
              <textarea 
                className={`${inputStyle} h-24 resize-none`} 
                placeholder="Ej. Cirugía de corazón (2015), Marcapasos..." 
                value={formData.history} 
                onChange={(e) => setFormData({...formData, history: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Atrás</button>
            <button onClick={handleNext} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">Siguiente <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {/* PASO 3: Contactos SOS */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <header>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Contactos SOS</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">¿A quién avisamos en caso de emergencia?</p>
          </header>

          <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] space-y-6 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12} className="text-myhealth-red" /> Contacto de Emergencia Principal</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelStyle}>Nombre del Familiar o Amigo</label>
                <input type="text" className={inputStyle} placeholder="Ej. María García" value={formData.contact1Name} onChange={(e) => setFormData({...formData, contact1Name: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}>Teléfono Directo</label>
                <input type="tel" className={inputStyle} placeholder="Ej. +52 33 1234 5678" value={formData.contact1Phone} onChange={(e) => setFormData({...formData, contact1Phone: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}>Parentesco</label>
                <input type="text" className={inputStyle} placeholder="Ej. Esposa, Hijo, Hermano" value={formData.contact1Relation} onChange={(e) => setFormData({...formData, contact1Relation: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Correo Electrónico (Opcional)</label>
                <input type="email" className={inputStyle} placeholder="familiar@correo.com" value={formData.contact1Email} onChange={(e) => setFormData({...formData, contact1Email: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Atrás</button>
            <button onClick={handleNext} disabled={!formData.contact1Name || !formData.contact1Phone} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-colors">Siguiente <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {/* PASO 4: Seguridad (PIN) */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in duration-300 py-6">
          <header className="text-center space-y-2">
            <div className="mx-auto w-20 h-20 bg-blue-50 rounded-[24px] flex items-center justify-center text-myhealth-blue mb-4 border border-blue-100">
              <Lock size={40} />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">PIN de Seguridad</h2>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
              Crea una clave de 4 dígitos. Los paramédicos la usarán para desbloquear tu historial clínico completo.
            </p>
          </header>

          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-[320px]">
              <input 
                type="password" 
                maxLength="4"
                className="w-full text-center text-5xl tracking-[0.8em] font-black p-6 rounded-[32px] border-2 border-slate-100 focus:border-myhealth-blue outline-none transition-all bg-slate-50/50 pr-0 pl-[0.8em] shadow-inner"
                placeholder="****"
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
              />
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
              <ShieldAlert size={14} className="text-amber-500" />
              <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest">No olvides este PIN</p>
            </div>
          </div>

          <div className="flex gap-4 mt-8 max-w-md mx-auto">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Atrás</button>
            <button onClick={handleNext} disabled={formData.pin.length !== 4} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-colors">Revisar Datos <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {/* PASO 5: Revisión Final */}
      {step === 5 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <header className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-[24px] flex items-center justify-center text-green-600 mb-4 border border-green-100">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Casi listo</h2>
            <p className="text-slate-500 text-sm font-medium">Revisa que toda tu información sea correcta antes de guardarla.</p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 max-h-[500px] md:max-h-none overflow-y-auto pr-2 custom-scrollbar border-y border-slate-50 py-6">
            {/* Sección 1: Personal */}
            <div className="bg-slate-50 p-6 rounded-[32px] relative group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
              <button onClick={() => goToStep(1)} className="absolute top-6 right-6 text-myhealth-blue opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={18} />
              </button>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><User size={12}/> Identidad</p>
              <p className="text-lg font-black text-slate-800 uppercase leading-none mb-2">{formData.name}</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">NSS: {formData.nss}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">TEL: {formData.phone}</p>
              </div>
            </div>

            {/* Sección 2: Médica */}
            <div className="bg-slate-50 p-6 rounded-[32px] relative group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
              <button onClick={() => goToStep(2)} className="absolute top-6 right-6 text-myhealth-blue opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={18} />
              </button>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Droplet size={12}/> Datos Médicos</p>
              <div className="flex gap-2 mb-4">
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-100 text-center flex-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Sangre</p>
                  <p className="text-lg font-black text-myhealth-red">{formData.bloodType}</p>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-100 text-center flex-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Donante</p>
                  <p className={`text-xs font-black ${formData.isDonor ? 'text-green-600' : 'text-slate-400'}`}>{formData.isDonor ? 'SÍ' : 'NO'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] text-slate-700 font-medium"><strong>Alergias:</strong> <span className="text-red-600 font-black uppercase">{formData.allergies || 'Ninguna'}</span></p>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed truncate"><strong>Historial:</strong> {formData.history || 'Ninguno registrado'}</p>
              </div>
            </div>

            {/* Sección 3: Contacto */}
            <div className="bg-slate-50 p-6 rounded-[32px] relative group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
              <button onClick={() => goToStep(3)} className="absolute top-6 right-6 text-myhealth-blue opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={18} />
              </button>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Phone size={12} className="text-myhealth-red" /> Contacto SOS</p>
              <p className="text-sm font-black text-slate-800 uppercase">{formData.contact1Name}</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">{formData.contact1Relation} • {formData.contact1Phone}</p>
            </div>

            {/* Sección 4: Seguridad */}
            <div className="bg-slate-50 p-6 rounded-[32px] relative group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
              <button onClick={() => goToStep(4)} className="absolute top-6 right-6 text-myhealth-blue opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={18} />
              </button>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Lock size={12}/> Seguridad</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-slate-800 tracking-widest">****</p>
                <span className="text-[10px] bg-blue-100 text-myhealth-blue px-2 py-0.5 rounded-full font-bold">CIFRADO</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button onClick={handleFinish} className="w-full bg-myhealth-blue hover:bg-blue-600 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all text-lg">
              VINCULAR Y GUARDAR EN BLOCKCHAIN
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
              <ShieldCheck size={12} /> Procesamiento seguro vía Monad Testnet
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
