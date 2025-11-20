import { Component, OnInit, ChangeDetectionStrategy, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserTypeService } from '../../core/services/user-type.service';
import { NgxGalaxyComponent } from '@omnedia/ngx-galaxy';
import Swal from 'sweetalert2';

interface Errors { errors: { [k: string]: string } }

const ERROR_MESSAGES: { [key: string]: string } = {
  'EMAIL_EXISTS': 'Este correo electrónico ya está registrado',
  'USERNAME_EXISTS': 'Este nombre de usuario ya está en uso',
  'INVALID_EMAIL': 'El formato del correo electrónico no es válido',
  'USERNAME_TOO_SHORT': 'El nombre de usuario debe tener al menos 3 caracteres',
  'PASSWORD_TOO_SHORT': 'La contraseña debe tener al menos 6 caracteres',
  'UID_CONFLICT': 'Error al generar identificador único, intenta de nuevo',
  'SLUG_CONFLICT': 'Error al generar slug de usuario, intenta de nuevo',
  'DUPLICATE_KEY': 'Ya existe un usuario con esta información'
};

@Component({
  selector: 'app-auth-page',
  standalone: true,
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxGalaxyComponent],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {
  authType = signal<'login' | 'register'>('login');
  title = signal<string>('');
  errors = signal<Errors>({ errors: {} });
  isSubmitting = signal<boolean>(false);
  authForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private userTypeService: UserTypeService,
    private fb: FormBuilder
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    (this.route.firstChild ?? this.route).url.subscribe(segments => {
      const last = segments[segments.length - 1]?.path as 'login' | 'register';
      this.authType.set((last === 'register') ? 'register' : 'login');

      this.title.set(this.authType() === 'login' ? 'Sign in' : 'Sign up');

      if (this.authType() === 'register' && !this.authForm.contains('username')) {
        this.authForm.addControl('username', new FormControl('', Validators.required));
      } else if (this.authType() === 'login' && this.authForm.contains('username')) {
        this.authForm.removeControl('username');
      }
    });
  }

  submitForm(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errors.set({ errors: {} });

    const credentials = this.authForm.value;

    this.userService.attemptAuth(this.authType(), credentials).subscribe({
      next: () => {
        this.isSubmitting.set(false);

        // Actualizar el rol en UserTypeService
        this.userTypeService.updateRole();

        const message = this.authType() === 'login' ? '¡Bienvenido de nuevo!' : '¡Cuenta creada exitosamente!';

        Swal.fire({
          icon: 'success',
          title: message,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigateByUrl('/');
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);

        let errorMessage = 'Error de autenticación. Por favor, intenta nuevamente.';
        let errorField = '';

        if (err.error) {
          const errorData = err.error;

          // Usar el mapa de mensajes si existe el código de error
          if (errorData.error && ERROR_MESSAGES[errorData.error]) {
            errorMessage = ERROR_MESSAGES[errorData.error];
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }

          // Si hay un campo específico, marcar el error en el formulario
          if (errorData.field) {
            errorField = errorData.field;

            const fieldErrors: { [key: string]: string } = {};
            fieldErrors[errorField] = errorMessage;
            this.errors.set({ errors: fieldErrors });

            const control = this.authForm.get(errorField);
            if (control) {
              control.setErrors({ serverError: errorMessage });
              control.markAsTouched();
            }
          } else {
            this.errors.set({ errors: { general: errorMessage } });
          }
        } else if (err.status === 404) {
          errorMessage = 'Usuario no encontrado';
          this.errors.set({ errors: { email: errorMessage } });
        } else if (err.status === 401) {
          errorMessage = 'Credenciales inválidas';
          this.errors.set({ errors: { password: errorMessage } });
        } else {
          this.errors.set({ errors: { general: errorMessage } });
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
}
