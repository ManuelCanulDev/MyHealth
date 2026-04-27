# MyHealth Frontend 🎨💊

El frontend de **MyHealth** es una aplicación web moderna diseñada para que los usuarios gestionen su información de salud, configuren sus contactos de emergencia y visualicen el historial de accesos a su ficha médica.

## 🌟 Características

- **Gestión de Ficha Médica:** Formulario intuitivo para actualizar alergias, condiciones, medicamentos y notas de emergencia directamente en la Blockchain.
- **Directorio de Contactos SOS:** Configuración de contactos de emergencia con capacidad de activar notificaciones automáticas.
- **Perfil de Usuario:** Personalización con fotografía, datos de identificación y preferencias religiosas para asistencia personalizada.
- **Visualización de Emergencia:** Vista rápida de la ficha médica optimizada para dispositivos web.
- **Integración con Monad:** Conectividad transparente con la red Monad a través de la API MyHealth.
- **Diseño Responsivo:** Interfaz adaptativa que funciona perfectamente en móviles y computadoras.

## 🛠️ Tecnologías

- **Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Gestión de Estado:** Hooks de React para sincronización con el backend.

## 🚀 Guía de Inicio

### Requisitos previos
- Node.js (v18 o superior)
- npm

### Instalación

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configuración:
   Crea o verifica el archivo de configuración para apuntar a la URL de tu API backend de MyHealth.

### Desarrollo

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera la versión de producción en la carpeta `dist`.
- `npm run lint`: Ejecuta el linter para asegurar la calidad del código.

## 📁 Estructura del Código

```text
src/
├── api.js         # Cliente para comunicación con el Backend Node.js
├── assets/        # Imágenes y recursos estáticos
├── components/    # Componentes de UI (Landing, Perfil, Contactos, etc.)
├── App.jsx        # Enrutamiento y estructura principal
└── main.jsx       # Punto de entrada de React
```

## 🔗 Conexión con el Ecosistema
Este frontend consume los endpoints de la API MyHealth, lo que permite que cualquier cambio realizado aquí se refleje instantáneamente on-chain y sea accesible para la aplicación móvil de rescate.

---
Desarrollado para la salud del mañana en **Monad**.
