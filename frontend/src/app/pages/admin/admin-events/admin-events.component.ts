import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminEventService, AdminEvent } from '../../../core/services/admin-event.service';
import { AdminCategoryService, AdminCategory } from '../../../core/services/admin-category.service';
import { AdminSearchComponent } from '../../../shared/admin-search/admin-search.component';
import { AdminFiltersComponent, FilterOption } from '../../../shared/admin-filters/admin-filters.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSearchComponent, AdminFiltersComponent],
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminEventsComponent implements OnInit {
  events = signal<AdminEvent[]>([]);
  filteredEvents = signal<AdminEvent[]>([]);
  categories = signal<AdminCategory[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isEditing = signal(false);
  editingSlug = signal<string | null>(null);

  eventForm: FormGroup;
  isSubmitting = false;
  searchTerm = '';
  filterStatus: string = 'all';
  filterCategory: string = 'all';

  statusFilterOptions: FilterOption[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'draft', label: 'Borradores' },
    { value: 'published', label: 'Publicados' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  categoryFilterOptions = signal<FilterOption[]>([{ value: 'all', label: 'Todas las categorías' }]);

  constructor(
    private adminEventService: AdminEventService,
    private adminCategoryService: AdminCategoryService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(160)]],
      date: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['EUR', Validators.required],
      location: ['', Validators.maxLength(200)],
      description: ['', Validators.maxLength(2000)],
      category: ['', Validators.required],
      status: ['draft', Validators.required],
      isActive: [true],
      mainImage: ['', Validators.maxLength(500)],
      images: [[]],
      stock: [null, Validators.min(0)]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadEvents();
  }

  loadCategories() {
    this.adminCategoryService.getAll().subscribe({
      next: (categories) => {
        // Filtrar solo categorías activas
        const activeCategories = categories.filter(c => c.status === 'active' && c.isActive);
        this.categories.set(activeCategories);

        // Actualizar opciones de filtro de categoría
        const categoryOptions: FilterOption[] = [
          { value: 'all', label: 'Todas las categorías' },
          ...activeCategories.map(cat => ({ value: cat.slug, label: cat.name }))
        ];
        this.categoryFilterOptions.set(categoryOptions);

        this.cd.markForCheck();
      },
      error: (err) => {

      }
    });
  }

  loadEvents() {
    this.isLoading.set(true);
    this.cd.markForCheck();

    this.adminEventService.getAll({ limit: 100, sortBy: 'date', sortOrder: 'desc' }).subscribe({
      next: (response) => {
        this.events.set(response.events);
        this.applyFilters();
        this.isLoading.set(false);
        this.cd.markForCheck();
      },
      error: (err) => {

        this.isLoading.set(false);
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los eventos',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.events()];

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        (event.description && event.description.toLowerCase().includes(term)) ||
        (event.location && event.location.toLowerCase().includes(term))
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(event => event.status === this.filterStatus);
    }

    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === this.filterCategory);
    }

    this.filteredEvents.set(filtered);
    this.cd.markForCheck();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm.toLowerCase();
    this.applyFilters();
  }

  onStatusFilterChange(status: string) {
    this.filterStatus = status;
    this.applyFilters();
  }

  onCategoryFilterChange(category: string) {
    this.filterCategory = category;
    this.applyFilters();
  }

  openCreateForm() {
    this.isEditing.set(false);
    this.editingSlug.set(null);
    this.eventForm.reset({
      status: 'draft',
      isActive: true,
      currency: 'EUR',
      price: 0,
      images: [],
      stock: null
    });
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  openEditForm(event: AdminEvent) {
    this.isEditing.set(true);
    this.editingSlug.set(event.slug);

    // Formatear la fecha para el input datetime-local
    const dateValue = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';

    this.eventForm.patchValue({
      title: event.title,
      date: dateValue,
      price: event.price,
      currency: event.currency,
      location: event.location || '',
      description: event.description || '',
      category: event.category,
      status: event.status,
      isActive: event.isActive,
      mainImage: event.mainImage || '',
      images: event.images || [],
      stock: event.stock
    });
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  closeForm() {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingSlug.set(null);
    this.eventForm.reset();
    this.cd.markForCheck();
  }

  submitForm() {
    if (this.eventForm.invalid) {
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

    const formData = { ...this.eventForm.value };

    // Convertir la fecha al formato ISO
    if (formData.date) {
      formData.date = new Date(formData.date).toISOString();
    }

    const request = this.isEditing()
      ? this.adminEventService.update(this.editingSlug()!, formData)
      : this.adminEventService.create(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeForm();
        this.loadEvents();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Evento ${this.isEditing() ? 'actualizado' : 'creado'} correctamente`,
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
          text: err.error?.message || `No se pudo ${this.isEditing() ? 'actualizar' : 'crear'} el evento`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  deleteEvent(event: AdminEvent) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminEventService.delete(event.slug).subscribe({
          next: () => {
            this.loadEvents();

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Evento eliminado correctamente',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No se pudo eliminar el evento',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'draft': 'badge-warning',
      'published': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'draft': 'Borrador',
      'published': 'Publicado',
      'cancelled': 'Cancelado'
    };
    return texts[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number, currency: string): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(price);
  }

  getCategoryName(categorySlug: string): string {
    const category = this.categories().find(c => c.slug === categorySlug);
    return category ? category.name : categorySlug;
  }

  addImageUrl() {
    const currentImages = this.eventForm.get('images')?.value || [];
    this.eventForm.patchValue({ images: [...currentImages, ''] });
  }

  removeImageUrl(index: number) {
    const currentImages = this.eventForm.get('images')?.value || [];
    currentImages.splice(index, 1);
    this.eventForm.patchValue({ images: [...currentImages] });
  }

  updateImageUrl(index: number, value: string) {
    const currentImages = this.eventForm.get('images')?.value || [];
    currentImages[index] = value;
    this.eventForm.patchValue({ images: [...currentImages] });
  }
}
