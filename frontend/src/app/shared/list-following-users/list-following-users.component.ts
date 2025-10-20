import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-list-following-users',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './list-following-users.component.html',
    styleUrls: ['./list-following-users.component.css']
})
export class ListFollowingUsersComponent implements OnInit {
    followingUsers = signal<User[]>([]);
    isLoading = signal<boolean>(true);
    errorMessage = signal<string>('');

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadFollowingUsers();
    }

    private loadFollowingUsers(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.userService.getFollowingUsers().subscribe({
            next: (response) => {
                console.log('Following users received:', response);
                this.followingUsers.set(response.users || []);
                this.isLoading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading following users:', err);
                this.errorMessage.set('Error al cargar los usuarios que sigues');
                this.isLoading.set(false);
            }
        });
    }

    // Método para dejar de seguir a un usuario
    unfollowUser(username: string, event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        this.userService.unfollowUser(username).subscribe({
            next: () => {
                console.log(`Dejaste de seguir a ${username}`);
                // Eliminar el usuario de la lista de forma reactiva
                this.followingUsers.update(users => 
                    users.filter(user => user.username !== username)
                );
            },
            error: (err: any) => {
                console.error('Error al dejar de seguir:', err);
            }
        });
    }

    // Método para refrescar la lista
    public refresh(): void {
        this.loadFollowingUsers();
    }
}
