import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal, effect, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Signal local para el usuario - se actualiza automáticamente
  user = signal<User>({} as User);

  settingsForm: FormGroup;
  errors: Object = {};
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  isUploading = false;
  previewUrl: string | null = null;
  dragOver = false;
  private readonly imgbbKey = 'f25a39c5f0cfea2e96c07d88342f6f90';

  constructor(
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.settingsForm = this.fb.group({
      image: '',
      username: '',
      bio: '',
      email: '',
      password: ''
    });

    // Effect para reaccionar a cambios en el usuario global
    effect(() => {
      this.userService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe((globalUser) => {
          this.user.set(globalUser);
          this.settingsForm.patchValue(globalUser);
          this.previewUrl = globalUser?.image || null;
          this.cd.markForCheck();
        });
    });

    // Effect para reaccionar al signal de logout
    effect(() => {
      const logoutCount = this.userService.logoutSignal();
      if (logoutCount > 0) {
        console.log('🔄 Detectado logout - actualizando contenido de settings');
        this.cd.markForCheck();
      }
    });
  }

  ngOnInit() {
    // La inicialización se hace en el effect del constructor
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al endpoint de logout para limpiar la cookie HttpOnly
        this.userService.logout().subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Sesión cerrada',
              text: '¡Hasta pronto!',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.router.navigateByUrl('/');
            });
          },
          error: (err) => {
            console.error('Error al cerrar sesión:', err);
            // Aunque falle, redirigir
            this.router.navigateByUrl('/');
          }
        });
      }
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.cd.markForCheck();

    // Obtener el valor actual del usuario y actualizarlo
    const currentUser = this.user();
    this.updateUser(this.settingsForm.value, currentUser);

    this.userService.update(currentUser).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        this.cd.markForCheck();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Tus datos se han actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigateByUrl('/profile/' + updatedUser.username);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errors = err.error?.errors || {};
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron actualizar los datos. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  updateUser(values: Object, user: User): User {
    // Actualizar solo los campos que no están vacíos
    Object.keys(values).forEach(key => {
      const value = (values as any)[key];
      // Si el campo no está vacío, actualizar el usuario
      if (value !== '' && value !== null && value !== undefined) {
        (user as any)[key] = value;
      }
    });
    return user;
  }

  /* ==========================
     imgbb Uploader
     ========================== */
  onFilePicked(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.dragOver = false;
    const file = ev.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }
  onDragOver(ev: DragEvent) { ev.preventDefault(); this.dragOver = true; }
  onDragLeave() { this.dragOver = false; }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      Swal.fire('Archivo inválido', 'Debes seleccionar una imagen.', 'warning');
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      Swal.fire('Archivo demasiado grande', 'Máximo 32 MB.', 'warning');
      return;
    }

    // Preview local inmediata
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result as string; this.cd.markForCheck(); };
    reader.readAsDataURL(file);

    // Subir a ImgBB
    this.isUploading = true; this.cd.markForCheck();
    this.uploadToImgbb(file)
      .then(url => {
        if (url) {
          this.settingsForm.get('image')?.setValue(url); // rellena tu campo existente
          this.previewUrl = url;                          // preview final con URL pública
        }
      })
      .catch(() => {
        Swal.fire('Error al subir', 'No se pudo subir la imagen. Inténtalo de nuevo.', 'error');
      })
      .finally(() => {
        this.isUploading = false; this.cd.markForCheck();
      });
  }


  private async uploadToImgbb(file: File): Promise<string> {
    const endpoint = `https://api.imgbb.com/1/upload?key=${this.imgbbKey}`;
    const fd = new FormData();
    fd.append('image', file);
    // fd.append('name', file.name.replace(/\.[^.]+$/, '')); // opcional

    const res: any = await this.http.post(endpoint, fd).toPromise();
    return res?.data?.display_url || '';
  }
}
