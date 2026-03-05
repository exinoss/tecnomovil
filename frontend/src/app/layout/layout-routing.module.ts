import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // ── Solo Admin ──────────────────────────────────────────────────────────
      {
        path: 'categorias',
        loadChildren: () => import('../pages/categorias/categorias.module').then(m => m.CategoriasModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'usuarios',
        loadChildren: () => import('../pages/usuarios/usuarios.module').then(m => m.UsuariosModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
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
      },
      {
        path: 'analisis-ia',
        loadChildren: () => import('../pages/analisis-ia/analisis-ia-module').then(m => m.AnalisisIaModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      // ── Admin + Vendedor ─────────────────────────────────────────────────────
      {
        path: 'productos',
        loadChildren: () => import('../pages/productos/productos.module').then(m => m.ProductosModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor'] }
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
      // ── Admin + Tecnico ──────────────────────────────────────────────────────
      {
        path: 'reparaciones',
        loadChildren: () => import('../pages/reparaciones/reparaciones.module').then(m => m.ReparacionesModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Tecnico'] }
      },
      // ── Admin + Vendedor + Tecnico ───────────────────────────────────────────
      {
        path: 'clientes',
        loadChildren: () => import('../pages/clientes/clientes.module').then(m => m.ClientesModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor', 'Tecnico'] }
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../pages/dashboard/dashboard-module').then(m => m.DashboardModule),
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Vendedor', 'Tecnico'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
