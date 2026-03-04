import { Injectable } from '@angular/core';

export interface ValidationResult {
  valid: boolean;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ValidacionService {

  identificacion(valor: string, tipo: string): ValidationResult {
    const v = valor.trim();
    if (!v) return { valid: false, mensaje: 'La identificación es requerida.' };

    if (!/^\d+$/.test(v)) return { valid: false, mensaje: 'La identificación solo debe contener números.' };

    if (tipo === 'Cedula') {
      if (v.length !== 10) return { valid: false, mensaje: 'La cédula debe tener exactamente 10 dígitos.' };
      if (!this.validarCedulaEC(v)) return { valid: false, mensaje: 'La cédula ingresada no es válida.' };
    }

    if (tipo === 'RUC') {
      if (v.length !== 13) return { valid: false, mensaje: 'El RUC debe tener exactamente 13 dígitos.' };
      if (!v.endsWith('001')) return { valid: false, mensaje: 'El RUC debe terminar en "001".' };
    }

    if (tipo === 'Pasaporte') {
      if (v.length < 5 || v.length > 20) return { valid: false, mensaje: 'El pasaporte debe tener entre 5 y 20 caracteres.' };
    }

    return { valid: true, mensaje: '' };
  }

  imei(valor: string): ValidationResult {
    const v = valor.trim();
    if (!v) return { valid: false, mensaje: 'El IMEI / número de serie es requerido.' };
    if (!/^\d{15}$/.test(v)) return { valid: false, mensaje: 'El IMEI debe tener exactamente 15 dígitos numéricos.' };
    return { valid: true, mensaje: '' };
  }

  serial(valor: string): ValidationResult {
    const v = valor.trim();
    if (!v) return { valid: false, mensaje: 'El número de serie es requerido.' };
    if (v.length < 4) return { valid: false, mensaje: 'El serial debe tener al menos 4 caracteres.' };
    if (v.length > 50) return { valid: false, mensaje: 'El serial no puede superar 50 caracteres.' };
    return { valid: true, mensaje: '' };
  }

  telefono(valor: string | undefined): ValidationResult {
    if (!valor || !valor.trim()) return { valid: true, mensaje: '' }; // es opcional
    const v = valor.trim();
    if (!/^\d{7,15}$/.test(v)) return { valid: false, mensaje: 'El teléfono debe tener entre 7 y 15 dígitos numéricos.' };
    return { valid: true, mensaje: '' };
  }

  email(valor: string | undefined): ValidationResult {
    if (!valor || !valor.trim()) return { valid: true, mensaje: '' }; // es opcional
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(valor.trim())) return { valid: false, mensaje: 'El formato del correo electrónico no es válido.' };
    return { valid: true, mensaje: '' };
  }

  password(valor: string): ValidationResult {
    if (!valor || valor.length < 6) return { valid: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
    if (valor.length > 100) return { valid: false, mensaje: 'La contraseña no puede superar 100 caracteres.' };
    return { valid: true, mensaje: '' };
  }

  requerido(valor: string, nombreCampo: string): ValidationResult {
    if (!valor || !valor.trim()) return { valid: false, mensaje: `${nombreCampo} es requerido.` };
    return { valid: true, mensaje: '' };
  }

  precio(valor: number): ValidationResult {
    if (valor == null || isNaN(valor)) return { valid: false, mensaje: 'El precio es requerido.' };
    if (valor <= 0) return { valid: false, mensaje: 'El precio debe ser mayor a 0.' };
    return { valid: true, mensaje: '' };
  }

  // Algoritmo módulo 10 para cédulas ecuatorianas
  private validarCedulaEC(cedula: string): boolean {
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return false;

    const digitos = cedula.split('').map(Number);
    const verificador = digitos[9];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let d = digitos[i];
      if (i % 2 === 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      suma += d;
    }

    const modulo = suma % 10;
    const digitoCalculado = modulo === 0 ? 0 : 10 - modulo;
    return digitoCalculado === verificador;
  }
}
