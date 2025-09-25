import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { CardEventComponent } from '../card-event/card-event.component';

@Component({
    selector: 'list-events',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule, CardEventComponent],
    templateUrl: './list-events.component.html',
    styleUrls: ['./list-events.component.css']
})
export class ListEventsComponent implements OnInit {
    events: Event[] = [];

    constructor(private eventService: EventService) { }

    ngOnInit(): void {
        this.loadEvents();
    }

    loadEvents(): void {
        this.eventService.getAllEvents().subscribe({
            next: (events) => {
                this.events = events;
            },
            error: (error) => {
                console.error('Error loading events:', error);
            }
        });
    }
}