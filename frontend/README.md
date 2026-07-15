# Frontend — TecnoMovil

SPA de gestión para TecnoMovil construida con **Angular 20** + **Tailwind CSS 4** + **Ionic** + **Capacitor**.

---

## Stack

- **Angular 20** (módulos, no standalone)
- **Tailwind CSS 4** (estilos)
- **Ionic Angular 8** (componentes UI móvil)
- **Capacitor 8** (empaquetado nativo Android)
- **Chart.js + ng2-charts** (gráficos del dashboard)
- **pdfmake** (generación de facturas en PDF)

---

## Requisitos previos

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (gestor usado en el proyecto)

---

## Instalación

Desde la carpeta `frontend/`:

```bash
pnpm install
```

---

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start` | `ng serve --host=127.0.0.1` | Servidor de desarrollo en `http://localhost:4200/` |
| `build` | `ng build` | Build de producción en `dist/frontend/browser/` |
| `watch` | `ng build --watch --configuration development` | Build incremental en modo desarrollo |
| `test` | `ng test` | Tests unitarios con Karma + Jasmine |
| `run:android:dev` | `ng build --configuration development` + `cap copy` + `gradlew installDebug` | Compila e instala la app en Android (backend LAN) |
| `run:android:pro` | `ng build` + `cap copy` + `gradlew installDebug` | Compila e instala la app en Android (backend nube) |

Uso:

```bash
pnpm start      # desarrollo web
pnpm build      # build de producción
pnpm test       # tests
```

> Los scripts `run:android:*` están documentados en [`ANDROID.md`](./ANDROID.md).

---

## Configuración de entorno

La URL del backend se define en `src/app/environments/`:

| Archivo | Uso | `apiUrl` |
|---------|-----|----------|
| `environment.ts` | Desarrollo | `http://192.168.000.000:5000/api` (IP local + puerto del backend) |
| `environment.prod.ts` | Producción | `https://tecnomovil-backend.onrender.com/api` |

> Cambia la IP/puerto según tu red local cuando desarrolles.

---

## Estructura

```
frontend/
├── src/app/
│   ├── auth/              # login + recuperación de contraseña
│   ├── core/              # modelos, servicios y guards
│   ├── environments/      # environment.ts / environment.prod.ts
│   ├── layout/            # shell (sidebar + topbar)
│   ├── pages/             # módulos de cada feature
│   │   ├── analisis-ia/
│   │   ├── atributos/
│   │   ├── categorias/
│   │   ├── clientes/
│   │   ├── configuracion/
│   │   ├── dashboard/
│   │   ├── facturas/
│   │   ├── inventario/
│   │   ├── productos/
│   │   ├── reparaciones/
│   │   └── usuarios/
│   └── shared/            # componentes reutilizables
├── android/               # proyecto nativo Capacitor (generado)
├── capacitor.config.ts    # config de Capacitor (appId, webDir)
└── angular.json
```

---

## Scaffolding

Para generar nuevos componentes/servicios:

```bash
pnpm ng generate component pages/nombre/nombre
pnpm ng generate service core/services/nombre
```

> Los módulos **no son standalone** — registra los nuevos componentes en su `*.module.ts`.

---

## Build de producción

```bash
pnpm build
```

Salida en `dist/frontend/browser/`. Esa carpeta es la que Capacitor copia al proyecto Android (`cap copy android`).

---

## Recursos

- [Angular CLI](https://angular.dev/tools/cli)
- [Tailwind CSS](https://tailwindcss.com/)
- [Capacitor](https://capacitorjs.com/docs)
- Para despliegue en Android ver [`ANDROID.md`](./ANDROID.md)