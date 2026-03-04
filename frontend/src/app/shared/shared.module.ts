import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  declarations: [ToastComponent, PaginationComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent, PaginationComponent]
})
export class SharedModule {}
