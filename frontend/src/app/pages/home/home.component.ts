import { Component } from '@angular/core';
import { ListEventsComponent } from '../../shared/list-events/list-events.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [ListEventsComponent, CommonModule, RouterModule]
})
export class HomeComponent {

}