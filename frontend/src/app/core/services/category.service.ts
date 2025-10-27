import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';
@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    constructor(private apiService: ApiService) { }

    getAllCategories(params?: any): Observable<Category[]> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        return this.apiService.get("/api/category", httpParams, 4000);
    }

    getCategoryBySlug(slug: string): Observable<Category> {
        return this.apiService.get(`/api/category/${slug}`, undefined, 4000);
    }

    all_categories_select(): Observable<Category[]> {
        return this.apiService.get("/api/categories_select_filter", undefined, 4000);
    }

}
