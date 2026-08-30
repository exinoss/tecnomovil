import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { BiometricService } from '../../core/services/biometric.service';
import { PinService } from '../../core/services/pin.service';
import { SessionLockService } from '../../core/services/session-lock.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const authServiceMock = {
    login: jasmine.createSpy('login'),
    restaurarSesion: jasmine.createSpy('restaurarSesion'),
    getHomeRoute: () => '/dashboard',
    isAuthenticated: () => false
  };
  const toastServiceMock = { show: jasmine.createSpy('show') };
  const biometricServiceMock = {
    isNative: () => false,
    isAvailable: () => Promise.resolve(false),
    isEnabled: () => Promise.resolve(false),
    desbloquear: () => Promise.resolve(null)
  };
  const pinServiceMock = {
    isAvailable: () => Promise.resolve(false),
    isEnabled: () => Promise.resolve(false),
    desbloquear: () => Promise.resolve(null)
  };
  const sessionLockServiceMock = {
    desbloquear: jasmine.createSpy('desbloquear'),
    estaDesbloqueada: () => true
  };
  const alertControllerMock = {
    create: () => Promise.resolve({ present: () => Promise.resolve() })
  };
  let router: Router;

  beforeEach(async () => {
    authServiceMock.login.calls.reset();
    toastServiceMock.show.calls.reset();
    sessionLockServiceMock.desbloquear.calls.reset();

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [CommonModule, FormsModule, RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: BiometricService, useValue: biometricServiceMock },
        { provide: PinService, useValue: pinServiceMock },
        { provide: SessionLockService, useValue: sessionLockServiceMock },
        { provide: AlertController, useValue: alertControllerMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra advertencia si faltan campos y no llama al backend', () => {
    component.identificacion = '';
    component.password = '';

    component.onSubmit();

    expect(toastServiceMock.show).toHaveBeenCalledWith('Complete todos los campos', 'warning');
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('inicia el contador de bloqueo cuando el backend responde bloqueado (RFC-001)', () => {
    authServiceMock.login.and.returnValue(of({
      success: false,
      message: 'Demasiados intentos fallidos. Intenta de nuevo en 15 minuto(s).',
      bloqueado: true,
      minutosRestantes: 15
    }));

    component.identificacion = '1234567890';
    component.password = 'incorrecta';
    component.onSubmit();

    expect(component.bloqueadoSegundosRestantes).toBe(15 * 60);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      'Demasiados intentos fallidos. Intenta de nuevo en 15 minuto(s).',
      'error'
    );
  });

  it('ignora el envío del formulario mientras el contador de bloqueo está activo', () => {
    component.bloqueadoSegundosRestantes = 60;
    component.identificacion = '1234567890';
    component.password = 'algo';

    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('inicia sesión y navega a la ruta de inicio cuando el login es exitoso', () => {
    authServiceMock.login.and.returnValue(of({
      success: true,
      message: 'Login exitoso',
      token: 'token-123',
      usuario: { idUsuario: 1, nombres: 'Ana', rol: 'Vendedor' }
    }));

    component.identificacion = '1234567890';
    component.password = 'correcta';
    component.onSubmit();

    expect(authServiceMock.restaurarSesion).toHaveBeenCalledWith(
      'token-123',
      jasmine.objectContaining({ nombres: 'Ana' })
    );
    expect(sessionLockServiceMock.desbloquear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
