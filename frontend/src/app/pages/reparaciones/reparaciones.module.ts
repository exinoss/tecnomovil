import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ReparacionesRoutingModule } from './reparaciones-routing.module';
import { ReparacionesComponent } from './reparaciones.component';

@NgModule({
  declarations: [ReparacionesComponent],
  imports: [SharedModule, ReparacionesRoutingModule]
})
export class ReparacionesModule { }
