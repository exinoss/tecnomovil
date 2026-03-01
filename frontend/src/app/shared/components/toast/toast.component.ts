import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  template: `
    <div class="fixed bottom-6 right-6 flex flex-col gap-2 max-w-sm" style="z-index:9999">
      <div *ngFor="let toast of toasts"
           class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4 text-white text-sm font-medium"
           [style.background]="bgColor(toast.type)"
           [style.border-left-color]="borderColor(toast.type)">
        <span class="text-lg flex-shrink-0">
          <ng-container [ngSwitch]="toast.type">
            <span *ngSwitchCase="'success'">&#10003;</span>
            <span *ngSwitchCase="'error'">&#10007;</span>
            <span *ngSwitchCase="'warning'">&#9888;</span>
            <span *ngSwitchDefault>&#8505;</span>
          </ng-container>
        </span>
        <span class="flex-1">{{ toast.message }}</span>
        <button (click)="dismiss(toast.id)" class="text-white/70 hover:text-white text-xl leading-none ml-1">&times;</button>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }

  bgColor(type: string): string {
    switch (type) {
      case 'success': return '#16a34a';
      case 'error':   return '#dc2626';
      case 'warning': return '#d97706';
      default:        return '#2563eb';
    }
  }

  borderColor(type: string): string {
    switch (type) {
      case 'success': return '#14532d';
      case 'error':   return '#7f1d1d';
      case 'warning': return '#78350f';
      default:        return '#1e3a8a';
    }
  }
}
