import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  itemType: 'event' | 'product';
  product?: {
    id: string;
    name: string;
    image?: string;
  };
  event?: {
    id: string;
    title: string;
    slug: string;
    date: string;
    mainImage?: string;
  };
}

export interface AdminPayment {
  id: string;
  amount: number;
  method: string;
  transactionRef?: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paidAt?: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  uid: string;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'failed';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  items: AdminOrderItem[];
  payment?: AdminPayment;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private apiUrl = `${environment.adminServerUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getAll(filters?: AdminOrderFilters): Observable<AdminOrdersResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.userId) params = params.set('userId', filters.userId);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<AdminOrdersResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.apiUrl}/${id}`);
  }
}
