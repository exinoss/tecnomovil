import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionLockService } from '../services/session-lock.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private sessionLock: SessionLockService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated() && this.sessionLock.estaDesbloqueada()) {
      return true;
    }
    this.router.navigate(['/auth']);
    return false;
  }
}
