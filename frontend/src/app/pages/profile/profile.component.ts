import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsComponent } from '../../shared/settings/settings.component';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, SettingsComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private userService = inject(UserService);
    
    // Signals locales del componente
    user = signal<User>({} as User);
    currentView = signal<string>('profile');

    private destroy$ = new Subject<void>();

    ngOnInit() {
        // Suscribirse al observable global del usuario para actualizar el signal local
        this.userService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user) => {
                this.user.set(user); // Actualizar signal local con datos del observable global
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    showProfile() {
        this.currentView.set('profile');
    }

    showFavorites() {
        this.currentView.set('favorites');
    }

    showSettings() {
        this.currentView.set('settings');
    }

    isActive(view: string): boolean {
        return this.currentView() === view;
    }
}