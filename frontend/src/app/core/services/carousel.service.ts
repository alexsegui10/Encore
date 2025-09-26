import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CarouselHome, CarouselDetails, CarouselCategoriesResponse } from '../models/carousel.model';
import { environment } from '../../../environments/environment';

const URL = `http://127.0.0.1:4000/api/category`;

@Injectable({
  providedIn: 'root'
})
export class CarouselService {

  constructor(private http: HttpClient) { }

  // Para obtener las categorías del carousel del home
  getCarouselHome(): Observable<CarouselHome[]> {
    return this.http.get<CarouselCategoriesResponse>(URL)
      .pipe(
        map(response => response.categories || [])
      );
  }

  // Para obtener las imágenes del carousel de detalles del evento
  getCarouselDetails(slug: string | null): Observable<CarouselDetails> {
    if (!slug) {
      throw new Error('Slug is required');
    }
    return this.http.get<CarouselDetails>(`${URL}/${slug}`);
  }
}
