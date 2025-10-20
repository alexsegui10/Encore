import { Component, OnInit, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import Swal from 'sweetalert2';

interface Errors { errors: { [k: string]: string } }

@Component({
  selector: 'app-auth-page',
  standalone: true,
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
        const body = err ?? {};
        this.errors.set(body.errors ? body as Errors : { errors: { general: 'Error de autenticación' } });
        this.isSubmitting.set(false);

        const errorMessage = this.errors().errors['general'] ||
          this.errors().errors['email'] ||
          'Error de autenticación. Por favor, verifica tus credenciales.';

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
