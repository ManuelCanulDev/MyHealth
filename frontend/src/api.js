function firstNonEmptyString(...candidates) {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return null;
}

function getApiBaseUrl() {
  if (typeof window !== "undefined" && window.__ENV__) {
    const env = window.__ENV__;
    const fromRuntime = firstNonEmptyString(
      env.VITE_API_URL,
      env.VITE_API_BASE_URL,
      env.MYHEALTH_API_URL,
      env.API_BASE_URL,
    );
    if (fromRuntime) return fromRuntime;
  }
  const fromBuild = firstNonEmptyString(
    import.meta.env.VITE_API_URL,
    import.meta.env.VITE_API_BASE_URL,
    import.meta.env.MYHEALTH_API_URL,
  );
  if (fromBuild) return fromBuild;
  return "http://localhost:3000";
}

/**
 * Obtiene la ficha médica de un contrato específico.
 * @param {string} contractAddress 
 */
export const getMedicalRecord = async (contractAddress) => {
  const response = await fetch(`${getApiBaseUrl()}/api/ficha?contract=${contractAddress}`);
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
  const response = await fetch(`${getApiBaseUrl()}/api/ficha/actualizar`, {
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
  const response = await fetch(`${getApiBaseUrl()}/api/emergencia/alerta`, {
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

/**
 * Obtiene el estado actual del mapa de emergencias.
 */
export const getEmergencyMapAlert = async () => {
  const response = await fetch(`${getApiBaseUrl()}/api/mapa-de-emergencias/alerta`);
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener alerta del mapa');
    } catch (_) {
      throw new Error('Error al obtener alerta del mapa');
    }
  }
  return response.json();
};

/**
 * Agrega un contacto de emergencia.
 * @param {string} contractAddress 
 * @param {Object} data { nombre, parentesco, telefono, email }
 */
export const addEmergencyContact = async (contractAddress, data) => {
  const response = await fetch(`${getApiBaseUrl()}/api/contactos`, {
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
    throw new Error(error.error || 'Error al agregar contacto de emergencia');
  }
  return response.json();
};

