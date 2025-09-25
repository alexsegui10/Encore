import { Component } from '@angular/core';
import { ListEventsComponent } from '../../shared/list-events/list-events.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.css'],
    standalone: true,
    imports: [ListEventsComponent, CommonModule, RouterModule]
})
export class ShopComponent {

}