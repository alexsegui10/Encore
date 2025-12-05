import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrderService, AdminOrder } from '../../../core/services/admin-order.service';
import { AdminSearchComponent } from '../../../shared/admin-search/admin-search.component';
import { AdminFiltersComponent, FilterOption } from '../../../shared/admin-filters/admin-filters.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, AdminSearchComponent, AdminFiltersComponent, PaginationComponent],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOrders implements OnInit {
  orders = signal<AdminOrder[]>([]);
  filteredOrders = signal<AdminOrder[]>([]);
  isLoading = signal(true);
  selectedOrder = signal<AdminOrder | null>(null);
  showDetailModal = signal(false);

  searchTerm = '';
  filterStatus: string = 'all';
  currentPage = 1;
  totalPages: number[] = [];
  itemsPerPage = 20;
  totalItems = 0;

  // Opciones para el filtro genérico
  statusFilterOptions: FilterOption[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'refunded', label: 'Reembolsada' },
    { value: 'failed', label: 'Fallida' }
  ];

  constructor(
    private adminOrderService: AdminOrderService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.cd.markForCheck();

    this.adminOrderService.getAll({
      page: this.currentPage,
      limit: this.itemsPerPage,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }).subscribe({
      next: (response) => {
        this.orders.set(response.orders);
        this.totalItems = response.total;
        const pages = Math.ceil(response.total / this.itemsPerPage);
        this.totalPages = Array.from({ length: pages }, (_, i) => i + 1);
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
          text: 'No se pudieron cargar las órdenes',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.orders()];

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.uid.toLowerCase().includes(term) ||
        order.user.username.toLowerCase().includes(term) ||
        order.user.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.filterStatus);
    }

    this.filteredOrders.set(filtered);
    this.cd.markForCheck();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onFilterChange(status: string) {
    this.filterStatus = status;
    this.applyFilters();
  }

  viewDetails(order: AdminOrder) {
    this.selectedOrder.set(order);
    this.showDetailModal.set(true);
    this.cd.markForCheck();
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
    this.cd.markForCheck();
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'paid': 'status-paid',
      'cancelled': 'status-cancelled',
      'refunded': 'status-refunded',
      'failed': 'status-failed'
    };
    return statusMap[status] || '';
  }

  getPaymentStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'payment-pending',
      'completed': 'payment-completed',
      'failed': 'payment-failed',
      'cancelled': 'payment-cancelled'
    };
    return statusMap[status] || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  setPageTo(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  nextPage() {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }
}
