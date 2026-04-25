import React from 'react';
import { History, Shield, MapPin, ExternalLink } from 'lucide-react';

const ActivityView = () => {
  const logs = [
    {
      id: 1,
      event: "Escaneo de Emergencia",
      location: "Plaza de Armas, Guadalajara",
      actor: "Paramédico Unidad 04 (Cruz Roja)",
      time: "Hoy, 10:45 AM",
      status: "Finalizado",
      txHash: "0x3f2a...e9b1"
    },
    {
      id: 2,
      event: "Actualización de Datos",
      location: "App Móvil",
      actor: "Usuario (Tú)",
      time: "Ayer, 18:20 PM",
      status: "Sincronizado",
      txHash: "0x7d1b...a2c4"
    },
    {
      id: 3,
      event: "Vinculación de Dispositivo",
      location: "App Móvil",
      actor: "Sistema MiHealth",
      time: "22 Abr, 09:00 AM",
      status: "Exitoso",
      txHash: "0x9e5f...1d8e"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="space-y-1">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Bitácora de Seguridad</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Registros inmutables en Monad</p>
      </header>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${log.event.includes('Emergencia') ? 'bg-red-50 text-mihealth-red' : 'bg-blue-50 text-mihealth-blue'}`}>
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase leading-tight">{log.event}</p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight">{log.time}</p>
                </div>
              </div>
              <span className="text-[9px] bg-slate-100 px-2 py-1 rounded-full font-black text-slate-500 uppercase tracking-tighter">
                {log.status}
              </span>
            </div>

            <div className="space-y-2 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={12} />
                <p className="text-[11px] font-medium">{log.location}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400 font-medium italic italic">Por: {log.actor}</p>
                <div className="flex items-center gap-1 text-mihealth-blue">
                  <span className="text-[9px] font-mono">{log.txHash}</span>
                  <ExternalLink size={10} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900 rounded-3xl text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Transparencia Total</p>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          "Cada acceso a tu información genera un registro que nadie puede borrar ni modificar."
        </p>
      </div>
    </div>
  );
};

export default ActivityView;
