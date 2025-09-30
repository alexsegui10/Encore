import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CarouselHome, CarouselDetails } from '../models/carousel.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {

  constructor(private apiService: ApiService) { }

  // Para obtener las categorías del carousel del home
  getCarouselHome(): Observable<CarouselHome[]> {
    return this.apiService.get('/api/carousel', undefined, 4000)
      .pipe(
        map(response => response.categories)
      );
  }

  // Para obtener las imágenes del carousel de detalles del evento
  getCarouselDetails(slug: string | null): Observable<CarouselDetails> {
    if (!slug) {
      throw new Error('Slug is required');
    }
    return this.apiService.get(`/api/carousel/${slug}`, undefined, 4000)
      .pipe(
        map(response => ({
          images: response.evento?.images || [response.evento?.image || '/images/default-event.jpg']
        }))
      );
  }
}
