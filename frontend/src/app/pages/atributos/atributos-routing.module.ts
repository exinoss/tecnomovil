import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AtributosComponent } from './atributos.component';

const routes: Routes = [
  { path: '', component: AtributosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AtributosRoutingModule { }
