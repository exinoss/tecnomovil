# Despliegue en Android

La aplicación usa Capacitor sobre Angular. El proyecto nativo ya está generado en `frontend/android/`.

## Requisitos previos

- [Node.js 20+](https://nodejs.org/), Android Studio con Android SDK y JDK 17.
- Dependencias instaladas desde `frontend/`: `pnpm install`.
- Un teléfono Android con Opciones de desarrollador y Depuración USB/Wi-Fi, o un emulador AVD.

Desde `frontend/`, los scripts disponibles son:

| Script | Uso |
| --- | --- |
| `pnpm run:android:dev` | Compila desarrollo, copia a Android e instala en el destino ADB conectado. |
| `pnpm run:android:pro` | Compila producción, copia a Android e instala en el destino ADB conectado. |
| `pnpm run:g:android` | Genera solamente el APK debug y lo deja en `frontend/release-apk/app-debug.apk`. Si ya existe, lo reemplaza. |

Antes de un build de desarrollo, configura `apiUrl` en `src/app/environments/environment.ts` con la IP LAN del backend, nunca con `localhost`:

```typescript
apiUrl: 'http://192.168.xxx.xxx:5000/api'
```

Para producción, revisa `src/app/environments/environment.prod.ts`.

## Caso 1: teléfono físico por ADB (USB o Wi-Fi)

### Por USB

1. Activa **Opciones de desarrollador** y **Depuración USB** en el teléfono.
2. Conecta el teléfono por USB y acepta la autorización RSA que aparece en pantalla.
3. Comprueba la conexión:

```powershell
adb devices
```

El dispositivo debe aparecer con estado `device`. Después instala la aplicación:

```powershell
cd frontend
pnpm run:android:dev
```

### Por Wi-Fi usando `adb connect IP`

El PC y el teléfono deben estar en la misma red Wi-Fi. Este procedimiento es independiente de la conexión ADB por USB.

1. En el teléfono, abre **Opciones de desarrollador** > **Depuración inalámbrica** y actívala.
2. Selecciona **Emparejar dispositivo con código de emparejamiento**. Android mostrará una IP, un puerto de emparejamiento y un código.
3. Desde PowerShell, sincroniza/empareja el teléfono usando esos datos:

```powershell
adb pair 192.168.1.50:37123
# Escribe el código de emparejamiento que muestra el teléfono.
```

4. Vuelve a la pantalla principal de **Depuración inalámbrica** del teléfono y toma la IP y el **puerto de conexión**. Conéctalo a ADB:

```powershell
adb connect 192.168.1.50:42631
adb devices
```

Sustituye la IP y puertos de ejemplo por los indicados en tu teléfono: el puerto de `adb pair` puede ser distinto del puerto de `adb connect`. Cuando `adb devices` muestre `192.168.1.50:42631    device`, ejecuta:

```powershell
cd frontend
pnpm run:android:dev
```

Para desconectar la sesión Wi-Fi:

```powershell
adb disconnect 192.168.1.50:42631
```

> En teléfonos Android anteriores a 11, si el fabricante lo permite, conecta por USB, ejecuta `adb tcpip 5555`, desconecta el cable y usa `adb connect IP_DEL_TELEFONO:5555`. Ese es un modo heredado; en Android 11 o superior se recomienda el emparejamiento inalámbrico descrito arriba.

## Caso 2: emulador de Android Studio

1. Abre Android Studio y entra a **Device Manager**.
2. Crea un dispositivo virtual (AVD) si aún no existe y ejecútalo con el botón de reproducción.
3. Verifica que ADB lo detecte:

```powershell
adb devices
```

Debe aparecer un identificador como `emulator-5554    device`. Con el emulador iniciado, instala la aplicación:

```powershell
cd frontend
pnpm run:android:dev
```

No se utiliza `adb connect` para un AVD local: Android Studio lo registra automáticamente en ADB.

## Generar solo el APK

Este comando no instala la aplicación en un teléfono ni emulador. Compila Angular, sincroniza Capacitor, genera el APK debug y copia el resultado a una ubicación estable:

```powershell
cd frontend
pnpm run:g:android
```

Resultado: `frontend/release-apk/app-debug.apk`. Cada ejecución reemplaza el APK anterior.

## Solución de problemas

| Problema | Solución |
| --- | --- |
| `adb devices` no lista el teléfono | Activa la depuración, acepta la autorización RSA e instala el driver USB del fabricante si aplica. |
| `adb pair` o `adb connect` falla | Confirma que ambos equipos estén en la misma red y usa los puertos mostrados por el teléfono. Primero ejecuta `adb pair` con el puerto de emparejamiento y después `adb connect` con el puerto de conexión. |
| La app no carga datos | Comprueba que `apiUrl` no use `localhost` y que el backend sea accesible desde el teléfono/emulador. |
| Error de SDK | En Android Studio abre SDK Manager e instala Android SDK Platform 34 o superior. |
