import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      console.warn('⚠️ Formulario inválido');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;
    console.log('📝 Credenciales a enviar:', credentials);

    this.adminAuthService.login(credentials).subscribe({
      next: (admin) => {
        console.log('✅ Login exitoso, admin:', admin);
        console.log('🔑 Verificando token en localStorage:', localStorage.getItem('admin_jwtToken'));
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || err.message || 'Error en el login';
      }
    });
  }
}
