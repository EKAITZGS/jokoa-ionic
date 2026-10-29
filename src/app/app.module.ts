import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/auth.interceptor';
import { DecoradoComponent } from './pages/decorado.component';
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

@NgModule({
  declarations: [
    AppComponent,
    DecoradoComponent,
    SplashPage,
    LoginPage,
    RegistroPage,
    TabsPage,
    ProductosPage,
    DetallePage,
    TiendasPage,
    PedidosPage,
    PerfilPage,
    SoportePage,
  ],
  imports: [BrowserModule, FormsModule, IonicModule.forRoot({ mode: 'md' }), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
