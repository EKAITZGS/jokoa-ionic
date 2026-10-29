import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../../core/sesion.service';

// Los cuatro cuadrados del logo aparecen uno a uno con rebote; a los 1,7 s decide a dónde ir
@Component({
  selector: 'app-splash',
  standalone: false,
  template: `
    <ion-content [fullscreen]="true">
      <div class="splash">
        <app-decorado />
        <div class="logo">
          <i style="--i: 0"></i><i style="--i: 1"></i><i style="--i: 2"></i><i class="coral" style="--i: 3"></i>
        </div>
        <h1>Jokoa</h1>
        <p>by JuegAlmi</p>
      </div>
    </ion-content>
  `,
})
export class SplashPage implements OnInit, OnDestroy {
  private temporizador?: ReturnType<typeof setTimeout>;

  constructor(private router: Router, private sesion: SesionService) {}

  ngOnInit(): void {
    this.temporizador = setTimeout(() => {
      this.router.navigateByUrl(this.sesion.iniciada() ? '/tabs/juegos' : '/login', { replaceUrl: true });
    }, 1700);
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }
}
