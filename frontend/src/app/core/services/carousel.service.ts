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
    // Obtener eventos destacados en vez de categorías para mejor calidad
    return this.apiService.get('/api/eventos', new HttpParams().set('limit', '6'), 4000)
      .pipe(
        map(response => {
          // Transformar eventos a formato CarouselHome
          const events = response.events || [];
          return events.map((event: any) => {
            let imageUrl = event.mainImage || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';

            // Mejorar calidad de imágenes de Unsplash
            if (imageUrl.includes('unsplash.com')) {
              // Añadir parámetros para mejor calidad: 1920px ancho, calidad 85, fit crop
              imageUrl = imageUrl.split('?')[0] + '?w=1920&h=1080&fit=crop&q=85&auto=format';
            }

            return {
              name: event.title || event.name,
              image: imageUrl,
              slug: event.slug
            };
          });
        })
      );
  }

  // Para obtener las imágenes del carousel de detalles del eventos
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
