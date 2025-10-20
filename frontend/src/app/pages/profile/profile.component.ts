import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { switchMap, finalize, Observable } from 'rxjs';
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
export class ProfileComponent {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly userService = inject(UserService);
    
    private readonly _profileUsername: string;
    
    // Signals
    public user = signal<User | null>(null);
    public currentView = signal<string>('profile');
    public isOwnProfile = false;
    public isLoading = signal(true);
    public profileNotFound = signal(false);

    constructor() {
        this._profileUsername = this.route.snapshot.params['username'];
        this._loadProfile();
    }

    private _loadProfile(): void {
        this.isLoading.set(true);
        this.profileNotFound.set(false);

        this._constructUserProfileRequest()
            .subscribe({
                next: (data: { profile: User }) => {
                    this.user.set(data.profile);
                },
                error: (err) => {
                    console.error('Error al cargar perfil:', err);
                    this.profileNotFound.set(true);
                }
            });
    }

    private _constructUserProfileRequest(): Observable<{ profile: User }> {
        return this.userService.currentUser$.pipe(
            switchMap((currentUser) => {
                // Si no hay username en la URL o es el mismo que el usuario actual
                if (!this._profileUsername || currentUser?.username === this._profileUsername) {
                    this.isOwnProfile = true;
                    return this.userService.getProfile(currentUser!.username)
                        .pipe(finalize(() => this.isLoading.set(false)));
                }

                // Si es el perfil de otro usuario
                this.isOwnProfile = false;
                return this.userService.getProfile(this._profileUsername)
                    .pipe(finalize(() => this.isLoading.set(false)));
            })
        );
    }

    toggleFollow(): void {
        const currentUser = this.user();
        if (!currentUser) return;

        const isFollowing = currentUser.following;
        const username = currentUser.username;


        if (isFollowing) {
            // Dejar de seguir
            this.userService.unfollowUser(username).subscribe({
                next: (data: { profile: User }) => {
                    this.user.set(data.profile);
                },
                error: (err) => {
                    console.error('Error al dejar de seguir:', err);
                }
            });
        } else {
            // Seguir
            this.userService.followUser(username).subscribe({
                next: (data: { profile: User }) => {
                    this.user.set(data.profile);
                },
                error: (err) => {
                    console.error('Error al seguir:', err);
                }
            });
        }
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