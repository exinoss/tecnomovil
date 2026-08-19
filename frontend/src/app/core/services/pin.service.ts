import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BiometryType, NativeBiometric } from '@capgo/capacitor-native-biometric';
import { SesionGuardada } from '../models/auth.model';
import { isJwtExpired } from '../utils/jwt.util';

const PREF_KEY_ENABLED = 'pin_enabled';
const CREDENTIAL_SERVER = 'com.tecnomovil.app.device-credential';
const CREDENTIAL_USERNAME = 'tecnomovil-session-pin';

/** Android solo permite pedir el PIN/patrón/contraseña sin mezclar biometría desde la API 30 (Android 11). */
const ANDROID_SDK_MINIMO = 30;

@Injectable({ providedIn: 'root' })
export class PinService {

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  private async soportaCredencialSinBiometria(): Promise<boolean> {
    try {
      const info = await Device.getInfo();
      return (info.androidSDKVersion ?? 0) >= ANDROID_SDK_MINIMO;
    } catch {
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isNative()) return false;
    try {
      const [result, soportado] = await Promise.all([
        NativeBiometric.isAvailable(),
        this.soportaCredencialSinBiometria()
      ]);
      return result.deviceIsSecure && soportado;
    } catch {
      return false;
    }
  }

  async isEnabled(): Promise<boolean> {
    if (!this.isNative()) return false;
    const { value } = await Preferences.get({ key: PREF_KEY_ENABLED });
    return value === 'true';
  }

  async enable(sesion: SesionGuardada): Promise<void> {
    await NativeBiometric.setCredentials({
      username: CREDENTIAL_USERNAME,
      password: JSON.stringify(sesion),
      server: CREDENTIAL_SERVER
    });
    await Preferences.set({ key: PREF_KEY_ENABLED, value: 'true' });
  }

  async disable(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({ server: CREDENTIAL_SERVER });
    } catch {
      // no había credenciales guardadas, no hay nada que borrar
    }
    await Preferences.remove({ key: PREF_KEY_ENABLED });
  }

  async desbloquear(): Promise<SesionGuardada | null> {
    try {
      await NativeBiometric.verifyIdentity({
        title: 'Desbloquear TecnoMovil',
        subtitle: 'Usa el PIN, patrón o contraseña de tu celular',
        reason: 'Verifica tu identidad para continuar',
        allowedBiometryTypes: [BiometryType.DEVICE_CREDENTIAL]
      });
    } catch {
      return null;
    }

    try {
      const credentials = await NativeBiometric.getCredentials({ server: CREDENTIAL_SERVER });
      const sesion = JSON.parse(credentials.password) as SesionGuardada;
      return isJwtExpired(sesion.token) ? null : sesion;
    } catch {
      return null;
    }
  }
}
