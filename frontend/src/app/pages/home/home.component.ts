import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListCategoryComponent } from '../../shared/categorias/categorias.component';
import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent } from '../../shared/carrusel/carousel.component';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, CarouselModule, CarouselComponent, ListCategoryComponent]
})
export class HomeComponent {
}