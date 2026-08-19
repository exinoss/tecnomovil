import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { BiometryType, NativeBiometric } from '@capgo/capacitor-native-biometric';
import { SesionGuardada } from '../models/auth.model';
import { isJwtExpired } from '../utils/jwt.util';

const PREF_KEY_ENABLED = 'biometric_enabled';
const CREDENTIAL_SERVER = 'com.tecnomovil.app';
const CREDENTIAL_USERNAME = 'tecnomovil-session';

@Injectable({ providedIn: 'root' })
export class BiometricService {

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isNative()) return false;
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
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

  /** Solo biometría: el PIN del dispositivo es un método aparte, ver PinService. */
  async desbloquear(): Promise<SesionGuardada | null> {
    try {
      await NativeBiometric.verifyIdentity({
        title: 'Desbloquear TecnoMovil',
        subtitle: 'Usa tu huella o rostro',
        reason: 'Verifica tu identidad para continuar',
        allowedBiometryTypes: [
          BiometryType.FINGERPRINT,
          BiometryType.FACE_AUTHENTICATION,
          BiometryType.IRIS_AUTHENTICATION,
          BiometryType.MULTIPLE
        ]
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
