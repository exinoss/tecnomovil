import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReparacionesComponent } from './reparaciones.component';

const routes: Routes = [
  { path: '', component: ReparacionesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReparacionesRoutingModule { }
