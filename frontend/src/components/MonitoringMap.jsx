import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ShieldAlert, MapPin, Activity, Bell, X, CheckCircle2 } from 'lucide-react';

const MonitoringMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(-103.3440); // REDi Guadalajara
  const [lat] = useState(20.6736);
  const [zoom] = useState(15);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (map.current) return; // stops map from initializing more than once
    if (!mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [lng, lat],
        zoom: zoom,
        pitch: 45,
      });

      // Añadir marcador de la Central (REDi)
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-myhealth-blue/20 rounded-full animate-ping"></div>
          <div class="bg-myhealth-blue text-white p-2 rounded-full shadow-lg relative z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        </div>
      `;

      new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Fix para asegurar que el mapa ocupe el contenedor completo después de renderizar
      map.current.on('load', () => {
        map.current.resize();
      });

      // Simular alerta después de 5 segundos para el demo
      const timer = setTimeout(() => {
        setShowAlert(true);
        triggerEmergencyVisuals();
      }, 5000);

      return () => {
        clearTimeout(timer);
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (e) {
      console.error("Error inicializando MapLibre:", e);
    }
  }, [lng, lat, zoom]);

  const triggerEmergencyVisuals = () => {
    if (!map.current) return;

    // Ubicación simulada del accidente (cerca de REDi)
    const emgLng = -103.3455;
    const emgLat = 20.6750;

    const emgEl = document.createElement('div');
    emgEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-16 h-16 bg-red-600/40 rounded-full animate-ping"></div>
        <div class="bg-red-600 text-white p-3 rounded-full shadow-2xl relative z-10 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
      </div>
    `;

    new maplibregl.Marker(emgEl)
      .setLngLat([emgLng, emgLat])
      .addTo(map.current);

    map.current.flyTo({
      center: [emgLng, emgLat],
      zoom: 17,
      essential: true,
      duration: 2000
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] min-h-[500px] rounded-[40px] overflow-hidden border-4 border-slate-200 shadow-2xl bg-slate-100 flex flex-col">
      {/* Contenedor del mapa explícito */}
      <div ref={mapContainer} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      
      {/* Overlay de Control */}
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-slate-100 max-w-xs pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
          <h3 className="font-black uppercase italic tracking-tighter text-slate-800">Sistema de Monitoreo</h3>
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">
          Central: REDi Guadalajara<br />
          Estado: Escaneando Blockchain...
        </p>
      </div>

      {/* Modal de Alerta Simulada */}
      {showAlert && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-red-950/20 backdrop-blur-[2px] animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border-2 border-red-600 overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
            <div className="bg-red-600 p-6 text-white flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
                <Bell size={24} className="fill-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-100">Alerta de Impacto</p>
                <h4 className="text-xl font-black uppercase italic leading-none">Emergencia en Curso</h4>
              </div>
              <button onClick={() => setShowAlert(false)} className="ml-auto bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <MapPin className="text-red-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Ubicación Detectada</p>
                  <p className="text-sm font-bold text-slate-800">C. de Gante, Las Nueve Esquinas (A 150m de REDi)</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-red-50 p-4 rounded-3xl border border-red-100">
                <Activity className="text-red-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black text-red-400 uppercase">Estado Vital</p>
                  <p className="text-sm font-black text-red-600 uppercase">Escaneo NFC: Juan Pérez (O+)</p>
                </div>
              </div>

              <button 
                onClick={() => setShowAlert(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <CheckCircle2 size={18} /> Despachar Ambulancia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de Sonar Bottom */}
      <div className="absolute bottom-6 right-6 z-10 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full text-white flex items-center gap-3 border border-white/10 shadow-2xl pointer-events-none">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-myhealth-blue animate-bounce"></div>
          <div className="w-1 h-3 bg-myhealth-blue animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-1 h-3 bg-myhealth-blue animate-bounce [animation-delay:0.4s]"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Escaneando Monad Testnet</p>
      </div>
    </div>
  );
};

export default MonitoringMap;
