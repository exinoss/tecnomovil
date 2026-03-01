import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ConfiguracionRoutingModule } from './configuracion-routing.module';
import { ConfiguracionComponent } from './configuracion.component';

@NgModule({
  declarations: [ConfiguracionComponent],
  imports: [SharedModule, ConfiguracionRoutingModule, RouterModule]
})
export class ConfiguracionModule { }
