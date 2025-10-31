import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminUserService, AdminUser } from '../../../core/services/admin-user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isEditing = signal(false);
  editingUid = signal<string | null>(null);

  userForm: FormGroup;
  isSubmitting = false;
  searchTerm = '';

  constructor(
    private adminUserService: AdminUserService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      bio: [''],
      image: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.cd.markForCheck();

    this.adminUserService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.isLoading.set(false);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoading.set(false);
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;

    if (!term) {
      this.filteredUsers.set(this.users());
    } else {
      const filtered = this.users().filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.bio && user.bio.toLowerCase().includes(term))
      );
      this.filteredUsers.set(filtered);
    }
    this.cd.markForCheck();
  }

  openCreateForm() {
    this.isEditing.set(false);
    this.editingUid.set(null);
    this.userForm.reset({ status: 'active' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  openEditForm(user: AdminUser) {
    this.isEditing.set(true);
    this.editingUid.set(user.uid);
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      image: user.image || '',
      status: user.status,
      password: ''
    });
    // Hacer password opcional en edición
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  closeForm() {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingUid.set(null);
    this.userForm.reset();
    this.cd.markForCheck();
  }

  submitForm() {
    if (this.userForm.invalid) {
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

    const formData = { ...this.userForm.value };

    // Si es edición y no hay contraseña, eliminarla del objeto
    if (this.isEditing() && (!formData.password || formData.password.trim() === '')) {
      delete formData.password;
    }

    const request = this.isEditing()
      ? this.adminUserService.update(this.editingUid()!, formData)
      : this.adminUserService.create(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeForm();
        this.loadUsers();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Usuario ${this.isEditing() ? 'actualizado' : 'creado'} correctamente`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || `No se pudo ${this.isEditing() ? 'actualizar' : 'crear'} el usuario`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  deleteUser(user: AdminUser) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminUserService.delete(user.uid).subscribe({
          next: () => {
            this.loadUsers();

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Usuario eliminado correctamente',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No se pudo eliminar el usuario',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'badge-success',
      'blocked': 'badge-danger',
      'pending': 'badge-warning'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'active': 'Activo',
      'blocked': 'Bloqueado',
      'pending': 'Pendiente'
    };
    return texts[status] || status;
  }
}
