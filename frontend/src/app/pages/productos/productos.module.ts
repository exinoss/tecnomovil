import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProductosRoutingModule } from './productos-routing.module';
import { ProductosComponent } from './productos.component';

@NgModule({
  declarations: [ProductosComponent],
  imports: [SharedModule, ProductosRoutingModule]
})
export class ProductosModule {}
