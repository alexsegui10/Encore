import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent } from '../../shared/carrusel/carousel.component';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, CarouselModule, CarouselComponent]
})
export class HomeComponent {
    images = [
        { src: 'assets/img1.jpg', title: 'Imagen 1' },
        { src: 'assets/img2.jpg', title: 'Imagen 2' },
        { src: 'assets/img3.jpg', title: 'Imagen 3' },
        { src: 'assets/img4.jpg', title: 'Imagen 4' }
    ];
}