import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EnterpriseProductService, EnterpriseProduct } from '../../../core/services/enterprise-product.service';
import { EnterpriseCategoryService, EnterpriseCategory } from '../../../core/services/enterprise-category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enterprise-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enterprise-products.component.html',
  styleUrls: ['./enterprise-products.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnterpriseProductsComponent implements OnInit {
  products = signal<EnterpriseProduct[]>([]);
  filteredProducts = signal<EnterpriseProduct[]>([]);
  categories = signal<EnterpriseCategory[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);

  productForm: FormGroup;
  isSubmitting = false;
  searchTerm = '';

  constructor(
    private enterpriseProductService: EnterpriseProductService,
    private enterpriseCategoryService: EnterpriseCategoryService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockTotal: [0, [Validators.required, Validators.min(0)]],
      stockAvailable: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      image: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.enterpriseCategoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.cd.markForCheck();

    this.enterpriseProductService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.isLoading.set(false);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoading.set(false);
        this.cd.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;

    if (!term) {
      this.filteredProducts.set(this.products());
    } else {
      const filtered = this.products().filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
      this.filteredProducts.set(filtered);
    }
    this.cd.markForCheck();
  }

  openCreateForm() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.productForm.reset({ price: 0, stockTotal: 0, stockAvailable: 0 });
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  openEditForm(product: EnterpriseProduct) {
    this.isEditing.set(true);
    this.editingId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockTotal: product.stockTotal,
      stockAvailable: product.stockAvailable,
      categoryId: product.categoryId,
      image: product.image || ''
    });
    this.showForm.set(true);
    this.cd.markForCheck();
  }

  closeForm() {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingId.set(null);
    this.productForm.reset();
    this.cd.markForCheck();
  }

  submitForm() {
    if (this.productForm.invalid) {
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

    const formData = { ...this.productForm.value };

    const request = this.isEditing()
      ? this.enterpriseProductService.update(this.editingId()!, formData)
      : this.enterpriseProductService.create(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeForm();
        this.loadProducts();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Producto ${this.isEditing() ? 'actualizado' : 'creado'} correctamente`,
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
          text: err.error?.message || `No se pudo ${this.isEditing() ? 'actualizar' : 'crear'} el producto`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  deleteProduct(product: EnterpriseProduct) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enterpriseProductService.delete(product.id).subscribe({
          next: () => {
            this.loadProducts();

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Producto eliminado correctamente',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No se pudo eliminar el producto',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  }
}
