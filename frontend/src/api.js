function getApiBaseUrl() {
  if (typeof window !== "undefined" && window.__ENV__ && window.__ENV__.VITE_API_URL) {
    return window.__ENV__.VITE_API_URL;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:3000";
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Obtiene la ficha médica de un contrato específico.
 * @param {string} contractAddress 
 */
export const getMedicalRecord = async (contractAddress) => {
  const response = await fetch(`${API_BASE_URL}/api/ficha?contract=${contractAddress}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener la ficha médica');
  }
  return response.json();
};

/**
 * Actualiza la ficha médica de un contrato.
 * @param {string} contractAddress 
 * @param {Object} data 
 */
export const updateMedicalRecord = async (contractAddress, data) => {
  const response = await fetch(`${API_BASE_URL}/api/ficha/actualizar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contract: contractAddress,
      ...data
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar la ficha médica');
  }
  return response.json();
};

/**
 * Registra una alerta de emergencia.
 * @param {string} contractAddress 
 * @param {Object} location { lat, lng }
 * @param {string} details 
 */
export const triggerEmergencyAlert = async (contractAddress, location, details) => {
  const response = await fetch(`${API_BASE_URL}/api/emergencia/alerta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contract: contractAddress,
      lat: location.lat,
      lng: location.lng,
      detalle: details
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al enviar alerta de emergencia');
  }
  return response.json();
};
