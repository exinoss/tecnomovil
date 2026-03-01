import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FacturasRoutingModule } from './facturas-routing.module';
import { FacturasComponent } from './facturas.component';

@NgModule({
  declarations: [FacturasComponent],
  imports: [SharedModule, FacturasRoutingModule]
})
export class FacturasModule { }
