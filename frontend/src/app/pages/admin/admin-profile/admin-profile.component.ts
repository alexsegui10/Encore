import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { Admin } from '../../../core/services/admin-auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProfileComponent implements OnInit {
  admin = signal<Admin | null>(null);
  profileForm: FormGroup;
  errors: any = {};
  isSubmitting = false;

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.adminAuthService.currentAdmin$.subscribe((admin) => {
      if (admin) {
        this.admin.set(admin);
        this.profileForm.patchValue({
          username: admin.username,
          email: admin.email,
          password: ''
        });
        this.cd.markForCheck();
      }
    });
  }

  submitForm() {
    if (this.profileForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor, completa todos los campos correctamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.isSubmitting = true;
    this.cd.markForCheck();

    const updateData: any = {
      username: this.profileForm.value.username,
      email: this.profileForm.value.email
    };

    // Solo incluir password si se proporcionó uno nuevo
    if (this.profileForm.value.password && this.profileForm.value.password.trim() !== '') {
      updateData.password = this.profileForm.value.password;
    }

    this.adminAuthService.updateAdmin(updateData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.profileForm.patchValue({ password: '' }); // Limpiar campo de contraseña
        this.cd.markForCheck();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Tu perfil se ha actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errors = err.error?.errors || {};
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo actualizar el perfil. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión del panel de administración?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminAuthService.logout();

        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: '¡Hasta pronto!',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigateByUrl('/admin/login');
        });
      }
    });
  }
}
