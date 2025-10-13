import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
    user: User = {} as User;
    currentView: string = 'profile';
    isAuthenticated = false;
    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private userService: UserService,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Verificar si el usuario está autenticado
        this.userService.isAuthenticated
            .pipe(takeUntil(this.destroy$))
            .subscribe(authenticated => {
                this.isAuthenticated = authenticated;
                if (!authenticated) {
                    this.router.navigate(['/']);
                }
                this.cd.detectChanges();
            });

        // Obtener datos del usuario actual
        this.userService.currentUser
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                if (user && user.email) {
                    this.user = user;
                    this.cd.detectChanges();
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    showProfile() {
        this.currentView = 'profile';
        this.cd.detectChanges();
    }

    showFavorites() {
        this.currentView = 'favorites';
        this.cd.detectChanges();
    }

    showSettings() {
        this.currentView = 'settings';
        this.cd.detectChanges();
    }

    isActive(view: string): boolean {
        return this.currentView === view;
    }
}