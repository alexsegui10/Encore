import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';
import { AdminAuthService } from './admin-auth.service';
import { Router } from '@angular/router';

export type UserRole = 'admin' | 'cliente' | null;

@Injectable({
    providedIn: 'root'
})
export class UserTypeService {
    private currentRoleSignal = signal<UserRole>(null);

    public currentRole = this.currentRoleSignal.asReadonly();
    public isAdmin = computed(() => this.currentRoleSignal() === 'admin');
    public isCliente = computed(() => this.currentRoleSignal() === 'cliente');
    public isAuthenticated = computed(() => this.currentRoleSignal() !== null);

    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private adminAuthService: AdminAuthService,
        private router: Router
    ) {
        this.updateRole();
    }

    public updateRole(): boolean {
        const role = this.jwtService.getUserRole();
        const previousRole = this.currentRoleSignal();

        this.currentRoleSignal.set(role);

        if (previousRole !== null && role === null) {
            this.handleTokenLoss();
            return false;
        }

        return role !== null;
    }

    private handleTokenLoss(): void {
        this.adminAuthService.purgeAuth();
        this.userService.purgeAuth();
        this.router.navigate(['/']);
    }

    public getCurrentRole(): UserRole {
        return this.currentRoleSignal();
    }

    public populate(): void {
        const role = this.currentRoleSignal();

        if (role === 'admin') {
            this.adminAuthService.populate();
        } else if (role === 'cliente') {
            this.userService.populate();
        } else {
            this.adminAuthService.purgeAuth();
            this.userService.purgeAuth();
        }
    }

    public logout(): void {
        const role = this.currentRoleSignal();

        if (role === 'admin') {
            this.adminAuthService.logout();
        } else if (role === 'cliente') {
            this.userService.logout().subscribe();
        }

        this.currentRoleSignal.set(null);
    }

    public getAuthenticationObservable(): Observable<boolean> {
        const role = this.currentRoleSignal();
        return role === 'admin'
            ? this.adminAuthService.isAuthenticated$
            : this.userService.isAuthenticated$;
    }

    public getCurrentUserData(): Observable<any> {
        const role = this.currentRoleSignal();
        return role === 'admin'
            ? this.adminAuthService.currentAdmin$
            : this.userService.currentUser$;
    }
}
