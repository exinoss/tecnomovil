import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AnalisisIaRoutingModule } from './analisis-ia-routing-module';
import { AnalisisIa } from './analisis-ia';

@NgModule({
  declarations: [
    AnalisisIa
  ],
  imports: [
    CommonModule,
    FormsModule,
    AnalisisIaRoutingModule
  ]
})
export class AnalisisIaModule { }
