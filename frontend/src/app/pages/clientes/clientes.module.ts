import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ClientesRoutingModule } from './clientes-routing.module';
import { ClientesComponent } from './clientes.component';

@NgModule({
  declarations: [ClientesComponent],
  imports: [SharedModule, ClientesRoutingModule]
})
export class ClientesModule {}
