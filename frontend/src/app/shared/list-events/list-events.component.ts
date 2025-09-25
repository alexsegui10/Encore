import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { CardEventComponent } from '../card-event/card-event.component';

@Component({
    selector: 'list-events',
    standalone: true,
    imports: [CommonModule, FormsModule, CardEventComponent],
    templateUrl: './list-events.component.html',
    styleUrls: ['./list-events.component.css']
})
export class ListEventsComponent {
    events: Event[] = [];

    constructor() { }

    ngOnInit(): void {
    }
}