import { Component } from '@angular/core';

// Cuadrados redondeados de fondo (splash y login): repiten el motivo del logo
@Component({
  selector: 'app-decorado',
  standalone: false,
  template: `
    <div class="decorado" aria-hidden="true">
      <span style="top: -20px; left: 60px; width: 88px; height: 88px"></span>
      <span style="top: -30px; right: 40px; width: 100px; height: 100px"></span>
      <span class="cl" style="top: 70px; left: 80px; width: 40px; height: 40px"></span>
      <span class="cl" style="top: 110px; right: 70px; width: 28px; height: 28px"></span>
      <span style="bottom: -10px; left: -20px; width: 90px; height: 80px"></span>
      <span style="bottom: -20px; right: 30px; width: 80px; height: 80px"></span>
      <span class="co" style="bottom: 100px; left: 24px; width: 36px; height: 36px"></span>
    </div>
  `,
})
export class DecoradoComponent {}
