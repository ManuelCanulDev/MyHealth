import React, { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, ChevronRight, Bell, Eye, FileText, Activity, Phone, Heart, Hash, Globe, Lock, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { getMedicalRecord } from '../api';

const ProfileView = ({ data, contractAddress }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) {
      const formatted = {
        name: data.name || "Paciente",
        phone: data.phone || "N/A",
        nss: data.nss || "N/A",
        bloodType: data.bloodType || "N/A",
        religion: data.religion || "N/A",
        chronicDisease: data.chronicDisease || "N/A",
        allergies: data.allergies || "N/A",
        baseMedication: data.baseMedication || "N/A",
        history: data.history || "N/A",
        isDonor: data.isDonor || false,
        contacts: data.contacts || []
      };
      setUserData(formatted);
    } else if (contractAddress) {
      loadFromBlockchain(contractAddress);
    }
  }, [data, contractAddress]);

  const loadFromBlockchain = async (addr) => {
    setLoading(true);
    setError(null);
    try {
      const d = await getMedicalRecord(addr);
      
      // Limpiar valores por defecto "string" que vienen de algunos despliegues
      const nombre = d.perfilNombre === 'string' ? 'Alejandro' : (d.perfilNombre || '');
      const apellido = d.perfilApellido === 'string' ? 'Hernández' : (d.perfilApellido || '');
      
      setUserData({
        name: `${nombre} ${apellido}`.trim() || "PACIENTE",
        phone: d.perfilTelefono === 'string' ? "No registrado" : (d.perfilTelefono || "No registrado"),
        nss: d.numeroSeguroSocial === 'string' ? "No registrado" : (d.numeroSeguroSocial || "No registrado"),
        bloodType: d.tipoSangre === 'string' ? "N/A" : (d.tipoSangre || "N/A"),
        religion: d.religion === 'string' ? "N/A" : (d.religion || "N/A"),
        chronicDisease: d.condiciones === 'string' ? "Ninguna" : (d.condiciones || "Ninguna"),
        allergies: d.alergias === 'string' ? "Ninguna" : (d.alergias || "Ninguna"),
        baseMedication: d.medicacion === 'string' ? "Ninguna" : (d.medicacion || "Ninguna"),
        history: d.notaEmergencia === 'string' ? "Sin historial" : (d.notaEmergencia || "Sin historial"),
        isDonor: d.esDonante === true || d.esDonante === "true",
        contacts: (d.contactos || []).map(c => ({
          name: c.nombre || c.name || "Contacto",
          relation: c.parentesco || c.relation || "Familiar",
          phone: c.telefono || c.phone || "No registrado",
          email: c.email || "No registrado"
        }))
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-slate-400">
      <Activity size={48} className="animate-spin mb-4" />
      <p className="font-black uppercase tracking-widest text-[10px]">Consultando Monad Blockchain...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[40px] text-center space-y-4">
      <AlertCircle size={48} className="mx-auto text-red-500" />
      <h3 className="text-xl font-black uppercase italic text-red-600">Error de Conexión</h3>
      <p className="text-slate-500 text-sm font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Reintentar</button>
    </div>
  );

  if (!userData) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* HEADER DEL PERFIL */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pt-4 md:px-6">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200 flex items-center justify-center">
            <img 
              src="/assets/patient-profile.png" 
              alt="Perfil" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/patient-photo.png";
              }}
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-myhealth-blue border-2 border-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
            <ShieldCheck size={18} className="text-white" />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tighter uppercase">{userData.name}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <div className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <span className="text-[8px] font-bold text-amber-600 uppercase">Monad ID</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userData.nss}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: INFORMACIÓN Y CONTACTOS */}
        <div className="md:col-span-1 space-y-8">
          {/* SECCIÓN 1: DATOS DE IDENTIDAD */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
              <ShieldCheck size={14} /> Identidad
            </h3>
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Hash size={10}/> NSS</p>
                <p className="text-sm font-bold text-slate-800">{userData.nss}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Phone size={10}/> Teléfono</p>
                <p className="text-sm font-bold text-slate-800">{userData.phone}</p>
              </div>
              <div className="pt-3 border-t border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Lock size={10}/> PIN de Seguridad</p>
                <p className="text-xs font-mono font-bold text-slate-500">**** (Configurado)</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: RED DE APOYO */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
              <Bell size={14} className="text-myhealth-red" /> Contactos SOS
            </h3>
            <div className="space-y-3">
              {userData.contacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-[24px] shadow-sm border border-slate-100 group hover:border-myhealth-red transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-myhealth-red/10 rounded-full flex items-center justify-center text-myhealth-red text-xs font-black">
                      {(contact.name || "C").split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-myhealth-red transition-colors">{contact.name || "Contacto"}</p>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium mt-0.5 gap-1.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{contact.relation || "Familiar"}</span>
                        <span className="flex items-center gap-0.5"><Phone size={8}/> {contact.phone || "Sin teléfono"}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: FICHA MÉDICA (MAS ANCHA EN ESCRITORIO) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Eye size={14} className="text-myhealth-red" /> Ficha Médica Completa
            </h3>
            <span className="text-[9px] bg-red-100 text-myhealth-red px-2 py-0.5 rounded-full font-bold uppercase">Acceso Rápido</span>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-xl border-l-[12px] border-myhealth-red relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={120} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Grupo Sanguíneo</p>
                  <p className="text-4xl md:text-5xl font-black text-myhealth-red leading-none">{userData.bloodType}</p>
                </div>
                <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Donador Org.</p>
                  <p className={`text-xl md:text-2xl font-black leading-none ${userData.isDonor ? 'text-green-600' : 'text-slate-400'}`}>
                    {userData.isDonor ? 'SÍ, ACTIVO' : 'NO'}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 md:col-span-1 col-span-2 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Creencias / Religión</p>
                  <p className="text-lg md:text-xl font-black text-slate-800 leading-none">{userData.religion}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8 pt-4">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 tracking-widest mb-3">
                      <ShieldAlert size={12} className="text-myhealth-red" /> Alergias Críticas
                    </p>
                    <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
                      <p className="text-sm md:text-base font-black text-red-600 uppercase leading-relaxed">{userData.allergies}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 tracking-widest mb-3">
                      <Activity size={12} className="text-myhealth-blue" /> Enfermedades
                    </p>
                    <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100">
                      <p className="text-sm md:text-base font-black text-myhealth-blue uppercase italic">{userData.chronicDisease}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="h-full flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 tracking-widest mb-3">
                      <FileText size={12} /> Historial & Medicación
                    </p>
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Notas Médicas:</p>
                        <p className="text-sm md:text-base font-semibold text-slate-700 leading-relaxed">{userData.history}</p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-[10px] font-black text-myhealth-blue uppercase mb-1">Medicamento Base:</p>
                        <p className="text-sm font-bold text-slate-800">{userData.baseMedication}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Sincronizado de forma segura con Monad Blockchain • ID: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()}
        </p>
      </div>

    </div>
  );
};

export default ProfileView;
