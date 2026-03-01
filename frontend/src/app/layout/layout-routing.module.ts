import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      {
        path: 'categorias',
        loadChildren: () => import('../pages/categorias/categorias.module').then(m => m.CategoriasModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor'] }
      },
      {
        path: 'productos',
        loadChildren: () => import('../pages/productos/productos.module').then(m => m.ProductosModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor', 'Tecnico'] }
      },
      {
        path: 'clientes',
        loadChildren: () => import('../pages/clientes/clientes.module').then(m => m.ClientesModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor', 'Tecnico'] }
      },
      {
        path: 'usuarios',
        loadChildren: () => import('../pages/usuarios/usuarios.module').then(m => m.UsuariosModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'reparaciones',
        loadChildren: () => import('../pages/reparaciones/reparaciones.module').then(m => m.ReparacionesModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor', 'Tecnico'] }
      },
      {
        path: 'facturas',
        loadChildren: () => import('../pages/facturas/facturas.module').then(m => m.FacturasModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor'] }
      },
      {
        path: 'inventario',
        loadChildren: () => import('../pages/inventario/inventario.module').then(m => m.InventarioModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor'] }
      },
      {
        path: 'atributos',
        loadChildren: () => import('../pages/atributos/atributos.module').then(m => m.AtributosModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'configuracion',
        loadChildren: () => import('../pages/configuracion/configuracion.module').then(m => m.ConfiguracionModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
