import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AtributosRoutingModule } from './atributos-routing.module';
import { AtributosComponent } from './atributos.component';

@NgModule({
  declarations: [AtributosComponent],
  imports: [SharedModule, AtributosRoutingModule]
})
export class AtributosModule { }
