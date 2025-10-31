import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminCategoryService, AdminCategory } from '../../../core/services/admin-category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<AdminCategory[]>([]);
  filteredCategories = signal<AdminCategory[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isEditing = signal(false);
  editingSlug = signal<string | null>(null);

  categoryForm: FormGroup;
  isSubmitting = false;
  searchTerm = '';

  constructor(
    private adminCategoryService: AdminCategoryService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      image: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.cd.markForCheck();

    this.adminCategoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.filteredCategories.set(categories);
        this.isLoading.set(false);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.isLoading.set(false);
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las categorías',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;

    if (!term) {
      this.filteredCategories.set(this.categories());
    } else {
      const filtered = this.categories().filter(category =>
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term))
      );
      this.filteredCategories.set(filtered);
    }
    this.cd.markForCheck();
  }

  openCreateForm() {
    this.isEditing.set(false);
    this.editingSlug.set(null);
    this.categoryForm.reset({ status: 'active' });
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  openEditForm(category: AdminCategory) {
    this.isEditing.set(true);
    this.editingSlug.set(category.slug);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      status: category.status
    });
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  closeForm() {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingSlug.set(null);
    this.categoryForm.reset();
    this.cd.markForCheck();
  }

  submitForm() {
    if (this.categoryForm.invalid) {
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

    const formData = { ...this.categoryForm.value };

    const request = this.isEditing()
      ? this.adminCategoryService.update(this.editingSlug()!, formData)
      : this.adminCategoryService.create(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeForm();
        this.loadCategories();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Categoría ${this.isEditing() ? 'actualizada' : 'creada'} correctamente`,
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
          text: err.error?.message || `No se pudo ${this.isEditing() ? 'actualizar' : 'crear'} la categoría`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  deleteCategory(category: AdminCategory) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminCategoryService.delete(category.slug).subscribe({
          next: () => {
            this.loadCategories();

            Swal.fire({
              icon: 'success',
              title: 'Eliminada',
              text: 'Categoría eliminada correctamente',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No se pudo eliminar la categoría',
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
      'hidden': 'badge-warning',
      'archived': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'active': 'Activa',
      'hidden': 'Oculta',
      'archived': 'Archivada'
    };
    return texts[status] || status;
  }
}
