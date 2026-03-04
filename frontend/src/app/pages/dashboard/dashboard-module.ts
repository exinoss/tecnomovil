import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    BaseChartDirective
  ]
})
export class DashboardModule { }
