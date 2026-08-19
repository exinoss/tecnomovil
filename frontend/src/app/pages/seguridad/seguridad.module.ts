import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SeguridadRoutingModule } from './seguridad-routing.module';
import { SeguridadComponent } from './seguridad.component';

@NgModule({
  declarations: [SeguridadComponent],
  imports: [SharedModule, SeguridadRoutingModule]
})
export class SeguridadModule { }
