import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioInfo } from '../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
    <header class="bg-blue-600 text-white h-14 flex items-center justify-between px-4 shadow z-50 relative">
      <div class="flex items-center gap-3">
        <button (click)="toggleSidebar.emit()" class="p-1.5 rounded hover:bg-blue-700 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-bold tracking-wide">TecnoMovil</h1>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-sm text-right hidden sm:block">
          <div class="font-medium">{{ usuario?.nombres }}</div>
          <div class="text-blue-200 text-xs">{{ usuario?.rol }}</div>
        </div>
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold border border-blue-300">
          {{ usuario?.nombres?.charAt(0) || 'U' }}
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  usuario: UsuarioInfo | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
  }
}

