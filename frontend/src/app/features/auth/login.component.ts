import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { extraerMensajeError } from '../../core/models/biblioteca.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabIndex = signal(0);
  readonly cargando = signal(false);
  readonly errorMensaje = signal('');

  usuarioLector = '';
  claveLector = '';
  passwordEncargado = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.tabIndex.set(params['modo'] === 'encargado' ? 1 : 0);
      this.errorMensaje.set('');
    });
  }

  onTabChange(index: number): void {
    this.tabIndex.set(index);
    this.errorMensaje.set('');
  }

  rellenarDemoLector(usuario: string, clave: string): void {
    this.usuarioLector = usuario;
    this.claveLector = clave;
    this.errorMensaje.set('');
  }

  ingresarLector(): void {
    const u = this.usuarioLector.trim();
    const c = this.claveLector.trim();
    if (!u || !c) {
      this.errorMensaje.set('Ingresa tu usuario y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');
    this.auth.loginLector(u, c).subscribe({
      next: () => {
        this.cargando.set(false);
        this.auth.establecerPendientePrestar(null);
        this.router.navigate(['/lector']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(extraerMensajeError(err));
      },
    });
  }

  ingresarEncargado(): void {
    if (!this.passwordEncargado) {
      this.errorMensaje.set('Ingresa la contraseña de encargado.');
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');
    this.auth.loginEncargado(this.passwordEncargado).subscribe({
      next: () => {
        this.cargando.set(false);
        const rutaDestino = this.auth.pendientePrestar()
          ? ['/encargado/registrar-prestamo']
          : ['/encargado'];
        this.router.navigate(rutaDestino);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(extraerMensajeError(err));
      },
    });
  }
}
