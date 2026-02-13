## 1.Architecture design
```mermaid
graph TD
  A["User Browser"] --> B["React Frontend Application"]

  subgraph "Frontend Layer"
    B
  end

  subgraph "Browser Capabilities"
    C["HTML5 Audio"]
    D["Local Storage"]
    E["Canvas / DOM Rendering"]
  end

  B --> C
  B --> D
  B --> E
```

## 2.Technology Description
- Frontend: React@18 + TypeScript + vite
- Styling: tailwindcss@3 (atau CSS Modules bila sudah ada)
- Backend: None (konten/asset bersifat statis)

## 3.Route definitions
| Route | Purpose |
|---|---|
| / | Opening + Beranda (hero, navigasi, music player) |
| /game | Mini-game claw machine ambil hati |
| /kenangan | Galeri (highlight, timeline toggle, filter) + amplop & surat bersuara |
