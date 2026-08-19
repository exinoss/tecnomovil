import { Component, OnInit } from '@angular/core';
import { SessionLockService } from './core/services/session-lock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false
})
export class App implements OnInit {
  constructor(private sessionLockService: SessionLockService) {}

  ngOnInit(): void {
    this.sessionLockService.init();
  }
}
