import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AsesorPage } from './pages/asesor/asesor.page';
import { DetallePage } from './pages/detalle/detalle.page';
import { LoginPage } from './pages/login/login.page';
import { PedidosPage } from './pages/pedidos/pedidos.page';
import { PerfilPage } from './pages/perfil/perfil.page';
import { ProductosPage } from './pages/productos/productos.page';
import { RegistroPage } from './pages/registro/registro.page';
import { SoportePage } from './pages/soporte/soporte.page';
import { SplashPage } from './pages/splash/splash.page';
import { TabsPage } from './pages/tabs/tabs.page';
import { TiendasPage } from './pages/tiendas/tiendas.page';

const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashPage },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      { path: 'tienda', component: ProductosPage },
      { path: 'asesor', component: AsesorPage },
      { path: 'tiendas', component: TiendasPage },
      { path: 'pedidos', component: PedidosPage },
      { path: 'perfil', component: PerfilPage },
      { path: '', redirectTo: 'tienda', pathMatch: 'full' },
    ],
  },
  { path: 'detalle/:tipo/:id', component: DetallePage, canActivate: [authGuard] },
  { path: 'soporte', component: SoportePage, canActivate: [authGuard] },
  { path: '**', redirectTo: 'splash' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
