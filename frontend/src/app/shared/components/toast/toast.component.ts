import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  template: `
    <div class="fixed bottom-6 right-6 flex flex-col gap-3 w-full max-w-sm" style="z-index:9999">
      <div
        *ngFor="let toast of toasts"
        [attr.id]="getToastId(toast.type)"
        class="flex items-center w-full max-w-sm p-4 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded"
          [ngClass]="getIconClasses(toast.type)"
        >
          <ng-container [ngSwitch]="toast.type">
            <svg *ngSwitchCase="'success'" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/></svg>
            <svg *ngSwitchCase="'error'" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
            <svg *ngSwitchCase="'warning'" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <svg *ngSwitchDefault class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8h.01M12 12h.01M12 16h.01M10 11h2v5m-2-5h4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </ng-container>
          <span class="sr-only">{{ getSrLabel(toast.type) }}</span>
        </div>

        <div class="ms-3 text-sm font-normal">{{ toast.message }}</div>

        <button
          type="button"
          (click)="dismiss(toast.id)"
          class="ms-auto flex items-center justify-center text-body hover:text-heading bg-transparent box-border border border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded text-sm h-8 w-8 focus:outline-none"
          aria-label="Close"
        >
          <span class="sr-only">Close</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
        </button>
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

  getToastId(type: Toast['type']): string {
    if (type === 'success') return 'toast-success';
    if (type === 'error') return 'toast-danger';
    if (type === 'warning') return 'toast-warning';
    return 'toast-info';
  }

  getSrLabel(type: Toast['type']): string {
    if (type === 'success') return 'Check icon';
    if (type === 'error') return 'Error icon';
    if (type === 'warning') return 'Warning icon';
    return 'Info icon';
  }

  getIconClasses(type: Toast['type']): string {
    if (type === 'success') return 'text-fg-success bg-success-soft';
    if (type === 'error') return 'text-fg-danger bg-danger-soft';
    if (type === 'warning') return 'text-fg-warning bg-warning-soft';
    return 'text-fg-info bg-info-soft';
  }
}
