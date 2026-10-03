# Framework Laptop Configurator

A modern, high-performance web application for visually configuring Framework Laptops in real-time using interactive 3D models.

## Features

- **Interactive 3D Viewer**: Rotate, zoom, and inspect the laptop with smooth camera controls
- **Real-time Customization**: Change bezel colors, keyboard colors, and expansion cards instantly
- **Model Support**: Framework Laptop 13 Pro, using Framework's published CAD assembly
- **Open/Close Animation**: Smooth hinge animation with physics-like motion
- **Environment Presets**: Studio, Dark Studio, Desk, Floating, and Technical Blueprint
- **Screenshot Export**: Export as PNG or transparent PNG
- **Shareable Configuration**: Store and restore configurations via URL
- **Performance Optimized**: 60 FPS target with lazy loading and code splitting

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS
- **3D Rendering**: Three.js, React Three Fiber, Drei
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── viewer/          # 3D viewer components
│   │   ├── Viewer3D.tsx
│   │   └── LaptopModel.tsx
│   ├── configurator/    # Configuration UI components
│   │   ├── ConfiguratorSidebar.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── BezelSelector.tsx
│   │   ├── KeyboardSelector.tsx
│   │   ├── ExpansionCardSelector.tsx
│   │   ├── CameraControls.tsx
│   │   ├── EnvironmentSelector.tsx
│   │   └── ActionButtons.tsx
│   └── ui/              # Reusable UI components
├── features/            # Feature-specific modules
│   ├── bezel/
│   ├── keyboard/
│   └── expansion-cards/
├── store/               # Zustand state management
│   └── configuratorStore.ts
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and constants
│   └── constants.ts
├── types/               # TypeScript type definitions
│   └── index.ts
└── assets/              # Static assets
```

## Configuration Options

### Bezel Colors
- Black
- White
- Orange
- Lavender
- Green
- Red

### Keyboard Colors
- Black
- Gray
- Transparent

### Expansion Cards
- USB-C
- USB-A
- HDMI
- DisplayPort
- Ethernet
- SD Card
- MicroSD
- Audio Jack

### Camera Presets
- Front
- Rear
- Left
- Right
- Top
- Open
- Closed

### Environment Presets
- Studio
- Dark Studio
- Desk
- Floating
- Technical Blueprint

## URL State Sharing

Configurations can be shared via URL parameters:

```
/?model=13&bezel=orange&keyboard=transparent&slot1=usb-c&slot2=hdmi&open=true&environment=studio
```

## Performance

The application is optimized for:
- Desktop browsers
- Modern laptops
- Mobile devices

Performance features:
- Lazy loading with React.lazy
- Code splitting for vendor bundles
- Optimized Three.js rendering
- Material reuse to prevent model reloads

## Model asset

The 3D viewer uses Framework's Laptop 13 Pro CAD assembly, converted from STEP to glTF binary (`.glb`) for browser rendering. Framework Computer Inc. publishes the source CAD under CC BY 4.0. See `public/models/README.md` for attribution and source details.

## Future Enhancements

- Implement more expansion card types
- Add pricing calculator
- Integrate with Framework's e-commerce API
- Add AR/VR support
- Implement more detailed customization options

## License

MIT
