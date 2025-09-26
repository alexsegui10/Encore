import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CarouselHome, CarouselDetails } from '../models/carousel.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {

  constructor(private http: HttpClient) { }

  // Para obtener las categorías del carousel del home
  getCarouselHome(): Observable<CarouselHome[]> {
    return this.http.get<{categories: CarouselHome[]}>(`${environment.api_url}/carousel`)
      .pipe(
        map(response => response.categories)
      );
  }

  // Para obtener las imágenes del carousel de detalles del evento
  getCarouselDetails(slug: string | null): Observable<CarouselDetails> {
    if (!slug) {
      throw new Error('Slug is required');
    }
    return this.http.get<any>(`${environment.api_url}/carousel/${slug}`)
      .pipe(
        map(response => ({
          images: response.evento?.images || [response.evento?.image || '/images/default-event.jpg']
        }))
      );
  }
}
