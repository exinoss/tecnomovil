import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CategoriasRoutingModule } from './categorias-routing.module';
import { CategoriasComponent } from './categorias.component';

@NgModule({
  declarations: [CategoriasComponent],
  imports: [SharedModule, CategoriasRoutingModule]
})
export class CategoriasModule {}
