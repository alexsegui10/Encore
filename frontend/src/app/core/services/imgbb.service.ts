import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImgbbService {
  private readonly API_KEY = 'f25a39c5f0cfea2e96c07d88342f6f90';
  private readonly ENDPOINT = 'https://api.imgbb.com/1/upload';

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<{ url: string; deleteUrl?: string }> {
    const fd = new FormData();
    fd.append('image', file);

    const url = `${this.ENDPOINT}?key=${this.API_KEY}`;
    return this.http.post<any>(url, fd, { reportProgress: true, observe: 'events' }).pipe(
      map(event => {
        if (event.type === HttpEventType.Response) {
          const data = event.body?.data;
          return { url: data?.display_url as string, deleteUrl: data?.delete_url as string };
        }
        return { url: '' };
      })
    );
  }
}
