import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-list-user-orders',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './list-user-orders.component.html',
    styleUrls: ['./list-user-orders.component.css']
})
export class ListUsersOrdersComponent implements OnInit {
    userOrders = signal<any[]>([]);

    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserOrders();
    }

    private loadUserOrders(): void {
        this.userService.getUserOrders().subscribe({
            next: (response) => {

                this.userOrders.set(response.orders || []);
            },
            error: (err: any) => {

                Swal.fire('Error', 'Error al cargar tus pedidos', 'error');
            }
        });
    }

    public refresh(): void {
        this.loadUserOrders();
    }

    public getStatusText(status: string): string {
        const statusMap: { [key: string]: string } = {
            'pending': 'Pendiente',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }
}
