import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalisisIa } from './analisis-ia';

const routes: Routes = [{ path: '', component: AnalisisIa }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalisisIaRoutingModule { }
