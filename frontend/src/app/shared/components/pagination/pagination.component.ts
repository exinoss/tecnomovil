import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">

      <!-- Info -->
      <span class="text-xs text-gray-500">
        Mostrando
        <span class="font-semibold text-gray-700">{{ rangeStart }}–{{ rangeEnd }}</span>
        de
        <span class="font-semibold text-gray-700">{{ totalItems }}</span>
        registros
      </span>

      <!-- Buttons -->
      <div class="flex items-center gap-1">

        <!-- First -->
        <button
          (click)="go(1)"
          [disabled]="currentPage === 1"
          title="Primera página"
          class="pagination-btn"
          [class.disabled]="currentPage === 1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Prev -->
        <button
          (click)="go(currentPage - 1)"
          [disabled]="currentPage === 1"
          title="Página anterior"
          class="pagination-btn"
          [class.disabled]="currentPage === 1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Page numbers -->
        <ng-container *ngFor="let p of pages">
          <span *ngIf="p === -1" class="px-1 text-gray-400 text-xs select-none">…</span>
          <button
            *ngIf="p !== -1"
            (click)="go(p)"
            class="pagination-num"
            [class.active]="p === currentPage"
          >
            {{ p }}
          </button>
        </ng-container>

        <!-- Next -->
        <button
          (click)="go(currentPage + 1)"
          [disabled]="currentPage === totalPages"
          title="Página siguiente"
          class="pagination-btn"
          [class.disabled]="currentPage === totalPages"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Last -->
        <button
          (click)="go(totalPages)"
          [disabled]="currentPage === totalPages"
          title="Última página"
          class="pagination-btn"
          [class.disabled]="currentPage === totalPages"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7"/>
          </svg>
        </button>

      </div>
    </div>

    <!-- When only 1 page, show minimal info -->
    <div *ngIf="totalPages <= 1 && totalItems > 0" class="px-4 py-2 border-t border-gray-100 bg-white">
      <span class="text-xs text-gray-400">{{ totalItems }} registro{{ totalItems !== 1 ? 's' : '' }}</span>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .pagination-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #374151;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .pagination-btn:hover:not(.disabled) {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }
    .pagination-btn.disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .pagination-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 6px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #374151;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .pagination-num:hover:not(.active) {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }
    .pagination-num.active {
      background: #2563eb;
      border-color: #2563eb;
      color: white;
      cursor: default;
    }
  `]
})
export class PaginationComponent implements OnChanges {
  /** Total de ítems (longitud del array filtrado) */
  @Input() totalItems = 0;
  /** N.º de ítems por página */
  @Input() pageSize = 10;
  /** Página actual (1-based) */
  @Input() currentPage = 1;

  /** Emite el nuevo número de página cuando el usuario navega */
  @Output() pageChange = new EventEmitter<number>();

  totalPages = 0;
  pages: number[] = [];
  rangeStart = 0;
  rangeEnd = 0;

  ngOnChanges(_: SimpleChanges): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.rangeStart = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    this.rangeEnd = Math.min(this.currentPage * this.pageSize, this.totalItems);
    this.pages = this.buildPages();
  }

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  private buildPages(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);

    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }
}
