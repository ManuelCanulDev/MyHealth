import React, { useState, useEffect } from 'react';
import { Activity, Phone, AlertCircle, CheckCircle2, Droplet, Hash } from 'lucide-react';
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
        chronicDisease: data.chronicDisease || "Ninguna registrada",
        allergies: data.allergies || "Ninguna registrada",
        baseMedication: data.baseMedication || "Sin medicación",
        history: data.history || "Sin historial",
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
      
      // Limpiar valores por defecto "string" para evitar nombres falsos
      const nombre = d.perfilNombre === 'string' ? 'PACIENTE' : (d.perfilNombre || 'PACIENTE');
      const apellido = d.perfilApellido === 'string' ? '' : (d.perfilApellido || '');
      
      setUserData({
        name: `${nombre} ${apellido}`.trim() || "PACIENTE DESCONOCIDO",
        phone: d.perfilTelefono === 'string' ? "No registrado" : (d.perfilTelefono || "No registrado"),
        nss: d.numeroSeguroSocial === 'string' ? "No disponible" : (d.numeroSeguroSocial || "No disponible"),
        bloodType: d.tipoSangre === 'string' ? "N/A" : (d.tipoSangre || "N/A"),
        religion: d.religion === 'string' ? "No especificada" : (d.religion || "No especificada"),
        chronicDisease: d.condiciones === 'string' ? "Ninguna registrada" : (d.condiciones || "Ninguna registrada"),
        allergies: d.alergias === 'string' ? "Ninguna registrada" : (d.alergias || "Ninguna registrada"),
        baseMedication: d.medicacion === 'string' ? "Sin medicación" : (d.medicacion || "Sin medicación"),
        history: d.notaEmergencia === 'string' ? "Sin notas adicionales" : (d.notaEmergencia || "Sin notas adicionales"),
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

  const hasAllergies = userData.allergies && userData.allergies.toLowerCase() !== 'ninguna registrada' && userData.allergies.toLowerCase() !== 'ninguna' && userData.allergies.toLowerCase() !== 'n/a';

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* CABECERA CON FOTO (Estilo Emergencia) */}
      <div className="bg-red-600 text-white p-8 rounded-t-[40px] flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-inner relative">
        {contractAddress && (
          <div className="absolute top-4 right-6 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 hidden md:block">
            <p className="text-[10px] font-mono font-bold tracking-widest text-white/90">WALLET: {contractAddress}</p>
          </div>
        )}
        
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
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-200">Ficha Médica Activa</p>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{userData.name}</h2>
          {contractAddress && (
            <p className="md:hidden text-[9px] font-mono font-bold tracking-widest text-red-200 mt-2 bg-black/10 inline-block px-2 py-1 rounded-full break-all">
              {contractAddress}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 bg-white rounded-b-[40px] shadow-2xl overflow-hidden border-2 border-red-600">
        
        {/* BLOQUE 1: DATOS VITALES */}
        <div className="p-8 space-y-8 border-b md:border-b-0 md:border-r border-slate-100">
          
          <div className="flex items-center justify-between gap-6 bg-red-50 p-8 rounded-[32px] border-2 border-red-200">
            <div className="space-y-1">
              <p className="text-sm font-black text-red-600 uppercase">Tipo de Sangre</p>
              <p className="text-7xl md:text-9xl font-black text-red-600 leading-none">{userData.bloodType}</p>
            </div>
            <Droplet size={80} className="text-red-600 opacity-20" />
          </div>

          <div className={`p-8 rounded-[32px] border-4 ${hasAllergies ? 'border-red-600 bg-red-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            <p className={`text-sm font-black uppercase mb-2 ${hasAllergies ? 'text-red-100' : 'text-slate-400'}`}>Alergias Críticas</p>
            <p className="text-3xl md:text-5xl font-black leading-tight uppercase break-words">
              {userData.allergies}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-[32px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Donante</p>
              <p className="text-2xl font-black uppercase">{userData.isDonor ? 'SÍ' : 'NO'}</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-[32px] overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Seguro Social / ID</p>
              <p className="text-xl font-black text-slate-800 break-all">{userData.nss}</p>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: CONTACTOS Y MÁS INFO */}
        <div className="p-8 space-y-8 bg-slate-50/50 flex flex-col">
          
          {userData.contacts && userData.contacts.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Phone size={18} className="text-red-600" /> Contactos de Emergencia
              </h4>
              {userData.contacts.map((contact, i) => (
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
          ) : (
            <div className="p-6 bg-white rounded-[32px] border-2 border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase">Sin contactos registrados</p>
            </div>
          )}

          {/* HISTORIAL MÉDICO ABIERTO */}
          <div className="mt-auto p-8 bg-blue-600 text-white rounded-[32px] shadow-xl space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-200">Historial Médico Registrado</p>
            <p className="text-xl font-bold leading-relaxed">{userData.history}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-200">Enfermedades</p>
                <p className="text-sm font-black">{userData.chronicDisease}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-200">Medicación</p>
                <p className="text-sm font-black">{userData.baseMedication}</p>
              </div>
            </div>
            
            {(userData.religion && userData.religion !== 'No especificada' && userData.religion !== 'N/A') && (
              <div className="pt-4 border-t border-blue-500 mt-4">
                <p className="text-[10px] font-black uppercase text-blue-200">Religión / Creencias</p>
                <p className="text-sm font-black">{userData.religion}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {contractAddress && (
        <div className="flex justify-center py-8 mt-4">
          <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shadow-sm">
            <Hash size={16} className="text-slate-400" />
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              CONTRATO INTELIGENTE: {contractAddress}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;