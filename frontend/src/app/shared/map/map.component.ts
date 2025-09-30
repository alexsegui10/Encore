import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapa style="height:100%; width:100%"></div>`
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapa', { static: true }) mapaEl!: ElementRef<HTMLDivElement>;
  private map?: L.Map;

  ngAfterViewInit(): void {
    // Arreglar iconos por ruta (usa los copiados a /assets/leaflet)
    (L.Icon.Default.prototype as any)._getIconUrl = function(name: string) {
      const base = '/assets/leaflet/';
      switch (name) {
        case 'iconRetina': return base + 'marker-icon-2x.png';
        case 'icon':       return base + 'marker-icon.png';
        case 'shadow':     return base + 'marker-shadow.png';
      }
      return '';
    };

    this.map = L.map(this.mapaEl.nativeElement, {
      center: [40.4168, -3.7038], // Madrid
      zoom: 13
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

    const marker = L.marker([40.4168, -3.7038]).addTo(this.map);
    marker.bindPopup('<b>Hola Leaflet + Angular</b><br>Centro de Madrid');

    // Ejemplo: click para poner un marcador nuevo
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      L.marker(e.latlng).addTo(this.map!).bindPopup(`Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`).openPopup();
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
