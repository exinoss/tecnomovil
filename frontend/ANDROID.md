# Despliegue en Android

La app se empaqueta como APK/AAB usando **Capacitor** sobre el build de Angular. El proyecto Android ya está generado en `frontend/android/`.

---

## Requisitos previos

- [Node.js 20+](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio) con el **Android SDK** instalado
- **JDK 17** (incluido con Android Studio)
- Un dispositivo físico con **Depuración USB** activada **o** un emulador AVD
- Dependencias del frontend instaladas (`pnpm install` dentro de `frontend/`)

Verifica que Android Studio reconoce el SDK:

```bash
adb devices
```

> El dispositivo debe aparecer en la lista. Si no, acepta el diálogo de autorización en el teléfono.

---

## Scripts disponibles

Ambos scripts están en `frontend/package.json` y hacen lo mismo en 3 pasos:

1. `ng build` — compila Angular a `dist/frontend/browser/`
2. `cap copy android` — copia el build al proyecto nativo
3. `gradlew installDebug` — compila e instala el APK en el dispositivo conectado

| Script | Build de Angular | Caso de uso |
|--------|------------------|-------------|
| `pnpm run:android:dev` | `--configuration development` | Desarrollo local (API en LAN) |
| `pnpm run:android:pro` | producción | Testing con backend en la nube |

---

## 1. Configurar la URL del backend

Antes de compilar, revisa que la API apunte a una dirección **alcanzable desde el teléfono** (no `localhost`).

- **Dev** → `frontend/src/app/environments/environment.ts`
  ```typescript
  apiUrl: 'http://192.168.xxx.xxx:5000/api'  // IP local de tu PC + puerto del backend
  ```
- **Prod** → `frontend/src/app/environments/environment.prod.ts`
  ```typescript
  apiUrl: 'https://backend.com/api'
  ```

> El backend debe estar corriendo y el teléfono en la misma red WiFi para el modo `dev`.

---

## 2. Compilar e instalar

Desde `frontend/` ejecuta **uno** de los dos:

```bash
# Desarrollo (backend local en LAN)
pnpm run:android:dev

# Producción (backend en la nube)
pnpm run:android:pro
```

El APK se instala automáticamente en el dispositivo/emulador conectado y la app **TecnoMovil** aparece en el launcher.

---

## Generar un APK/AAB instalable manualmente

Si necesitas el archivo sin instalarlo por ADB:

```bash
cd frontend/android

# APK debug (para pruebas)
.\gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# AAB (para subir a Google Play)
.\gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `adb devices` no lista el teléfono | Activa Depuración USB e instala los drivers del fabricante |
| `gradlew` no reconocido | Ejecuta desde PowerShell dentro de `frontend/android/` usando `.\gradlew` |
| La app abre pero no carga datos | Verifica que `apiUrl` no sea `localhost` y que el backend esté accesible desde el teléfono |
| Error de SDK no encontrado | Abre Android Studio → SDK Manager e instala Android SDK Platform 34+ |
| Cambios no se reflejan | Borra `frontend/android/app/src/main/assets/public` y vuelve a correr el script |