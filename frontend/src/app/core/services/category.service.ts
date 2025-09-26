import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly apiUrl = 'http://127.0.0.1:4000/api/category';

    constructor(private http: HttpClient) { }

    /**
     * Obtiene todos los Categoryos
     * @param params - Parámetros de consulta opcionales (filtros, paginación, etc.)
     * @returns Observable con la lista de Categoryos
     */
    getAllCategories(params?: any): Observable<Category[]> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        return this.http.get<Category[]>(this.apiUrl, { params: httpParams });
    }

    /**
     * Obtiene un Categoryo específico por su slug
     * @param slug - Identificador único del Categoryo
     * @returns Observable con el Categoryo
     */
    getCategoryBySlug(slug: string): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${slug}`);
    }


}
