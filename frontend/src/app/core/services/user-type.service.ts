import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';
import { AdminAuthService } from './admin-auth.service';
import { EnterpriseAuthService } from './enterprise-auth.service';
import { Router } from '@angular/router';

export type UserRole = 'admin' | 'enterprise' | 'cliente' | null;

@Injectable({
    providedIn: 'root'
})
export class UserTypeService {
    private currentRoleSignal = signal<UserRole>(null);

    public currentRole = this.currentRoleSignal.asReadonly();
    public isAdmin = computed(() => this.currentRoleSignal() === 'admin');
    public isEnterprise = computed(() => this.currentRoleSignal() === 'enterprise');
    public isCliente = computed(() => this.currentRoleSignal() === 'cliente');
    public isAuthenticated = computed(() => this.currentRoleSignal() !== null);

    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private adminAuthService: AdminAuthService,
        private enterpriseAuthService: EnterpriseAuthService,
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
        this.enterpriseAuthService.purgeAuth();
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
        } else if (role === 'enterprise') {
            this.enterpriseAuthService.populate();
        } else if (role === 'cliente') {
            this.userService.populate();
        } else {
            this.adminAuthService.purgeAuth();
            this.enterpriseAuthService.purgeAuth();
            this.userService.purgeAuth();
        }
    }

    public logout(): void {
        const role = this.currentRoleSignal();

        if (role === 'admin') {
            this.adminAuthService.logout();
        } else if (role === 'enterprise') {
            this.enterpriseAuthService.logout();
        } else if (role === 'cliente') {
            this.userService.logout().subscribe();
        }

        this.currentRoleSignal.set(null);
    }

    public getAuthenticationObservable(): Observable<boolean> {
        const role = this.currentRoleSignal();
        if (role === 'admin') return this.adminAuthService.isAuthenticated$;
        if (role === 'enterprise') return this.enterpriseAuthService.isAuthenticated$;
        return this.userService.isAuthenticated$;
    }

    public getCurrentUserData(): Observable<any> {
        const role = this.currentRoleSignal();
        if (role === 'admin') return this.adminAuthService.currentAdmin$;
        if (role === 'enterprise') return this.enterpriseAuthService.currentEnterprise$;
        return this.userService.currentUser$;
    }
}
