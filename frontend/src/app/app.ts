import { Component, OnInit } from '@angular/core';
import { SessionLockService } from './core/services/session-lock.service';
import { BackButtonService } from './core/services/back-button.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false
})
export class App implements OnInit {
  constructor(
    private sessionLockService: SessionLockService,
    private backButtonService: BackButtonService
  ) {}

  ngOnInit(): void {
    this.sessionLockService.init();
    this.backButtonService.init();
  }
}
