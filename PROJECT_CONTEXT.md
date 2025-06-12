# Contexto del Proyecto LCQV Onboarding

## Descripción General
Este es un proyecto de onboarding automatizado desarrollado con Next.js 14.1.0, utilizando TypeScript y Tailwind CSS para el diseño.

## Estructura del Proyecto

### Tecnologías Principales
- Next.js 14.1.0
- React 18.2.0
- TypeScript
- Tailwind CSS
- Framer Motion (para animaciones)
- Sonner (para notificaciones)

### Estructura de Directorios
```
├── app/                    # Directorio principal de la aplicación
│   ├── restaurant/        # Rutas relacionadas con restaurantes
│   ├── closer/           # Rutas relacionadas con closers
│   ├── page.tsx          # Página principal
│   ├── layout.tsx        # Layout principal
│   └── globals.css       # Estilos globales
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes de UI básicos
│   ├── shared/          # Componentes compartidos
│   ├── footer.tsx       # Componente del pie de página
│   └── logo.tsx         # Componente del logo
├── lib/                 # Utilidades y funciones auxiliares
├── hooks/               # Custom hooks de React
└── context/            # Contextos de React
```

## Características Técnicas

### Estilizado
- Uso de Tailwind CSS para estilos
- Configuración personalizada en `tailwind.config.js`
- Utilización de `class-variance-authority` y `clsx` para manejo de clases condicionales

### Componentes UI
- Sistema de componentes modular
- Separación clara entre componentes UI básicos y componentes de negocio
- Uso de Framer Motion para animaciones

### Estructura de Rutas
- Implementación de rutas anidadas en Next.js
- Separación clara entre rutas de restaurantes y closers
- Layout principal compartido

## Notas Importantes

### Desarrollo
- El proyecto utiliza el sistema de módulos de Next.js
- Configuración TypeScript estricta
- ESLint configurado para mantener la calidad del código

### Dependencias Principales
- `framer-motion`: Para animaciones
- `sonner`: Para notificaciones toast
- `react-icons`: Para iconografía
- `class-variance-authority`: Para variantes de componentes
- `clsx` y `tailwind-merge`: Para manejo de clases CSS

### Scripts Disponibles
- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta el linter

## Consideraciones Técnicas

### Rendimiento
- Uso de componentes del lado del cliente cuando es necesario
- Optimización de imágenes a través de Next.js
- Implementación de lazy loading donde sea apropiado

### Mantenibilidad
- Estructura modular y escalable
- Separación clara de responsabilidades
- Uso de TypeScript para mejor mantenibilidad

### Seguridad
- Implementación de rutas protegidas
- Manejo seguro de datos sensibles
- Validación de datos en el cliente y servidor

## Próximos Pasos Sugeridos
1. Revisar y optimizar la estructura de componentes
2. Implementar pruebas unitarias
3. Mejorar la documentación de componentes
4. Optimizar el rendimiento de las animaciones
5. Implementar un sistema de caché más robusto

## Notas Adicionales
- El proyecto sigue las mejores prácticas de Next.js 14
- Se utiliza el App Router de Next.js
- Implementación de diseño responsive
- Sistema de temas claro/oscuro (si está implementado)

## Estructura de Páginas y Rutas

### Página Principal (`/`)
- Ruta: `app/page.tsx`
- Propósito: Landing page principal del sistema de onboarding
- Funcionalidad: Presenta la información general del sistema y opciones de navegación

### Sección de Restaurantes (`/restaurant`)
- Ruta: `app/restaurant/page.tsx`
- Propósito: Gestión de restaurantes en el sistema
- Funcionalidad: 
  - Listado y gestión de restaurantes
  - Acceso a formularios de registro
  - Visualización de información de restaurantes

#### Subsección de Formularios (`/restaurant/form`)
- Ruta: `app/restaurant/form/`
- Propósito: Formularios de registro y actualización de restaurantes
- Funcionalidad:
  - Formularios de registro de nuevos restaurantes
  - Actualización de información existente
  - Validación de datos

### Sección de Closers (`/closer`)
- Ruta: `app/closer/page.tsx`
- Propósito: Gestión de closers (representantes de ventas)
- Funcionalidad:
  - Registro y gestión de closers
  - Asignación de restaurantes
  - Seguimiento de métricas y desempeño

## Flujo de Usuario

### Flujo de Onboarding de Restaurantes
1. Acceso a la página principal
2. Navegación a la sección de restaurantes
3. Registro de nuevo restaurante
4. Completar formularios necesarios
5. Asignación de closer

### Flujo de Gestión de Closers
1. Acceso a la sección de closers
2. Registro de nuevo closer
3. Asignación de restaurantes
4. Seguimiento de métricas 