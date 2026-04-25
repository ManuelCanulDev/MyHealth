# MyHealth - Frontend 🎨

Este es el cliente web de la aplicación MyHealth, diseñado para ofrecer una experiencia rápida e intuitiva a rescatistas y pacientes. Está desarrollado con React, Vite y Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

- **Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Animaciones:** Tailwind Animate

## 📁 Estructura de Carpetas

```text
frontend/
├── public/        # Activos estáticos (favicon, imágenes públicas)
├── src/
│   ├── assets/    # Imágenes y SVG usados en los componentes
│   ├── components/# Componentes modulares de React (LandingPage, ProfileView, etc.)
│   ├── App.jsx    # Componente raíz que maneja el estado global y navegación
│   ├── main.jsx   # Punto de entrada de la aplicación
│   └── index.css  # Estilos globales y configuración de Tailwind
├── package.json   # Dependencias y scripts
└── vite.config.js # Configuración de Vite
```

## 🚀 Guía de Inicio

### Requisitos previos
- Node.js (v18 o superior)
- npm (o yarn/pnpm)

### Instalación

1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

- `npm run dev`: Inicia el servidor de desarrollo. Ábrelo en [http://localhost:5173](http://localhost:5173).
- `npm run build`: Construye la aplicación para producción en la carpeta `dist`.
- `npm run lint`: Ejecuta ESLint para buscar y corregir problemas de código.
- `npm run preview`: Sirve localmente la versión de producción para probarla antes del despliegue.

## 🔗 Integración con Backend (Próximamente)
Este cliente está diseñado para conectarse a una futura API backend que gestionará el estado con la Blockchain Monad y proveerá los datos persistentes de los usuarios.
