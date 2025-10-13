import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root',
})
export class UserTypeGuard implements CanActivate {
    constructor(private jwtService: JwtService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const token = this.jwtService.getToken();
        if (token) {
            try {
                // Decodificar el token
                const decodedToken: any = jwtDecode(token);
                console.log('decodedToken:', decodedToken);
                const userType = decodedToken?.user?.typeuser || decodedToken?.typeuser;
                console.log('userType:', userType);
                const requiredTypeUser = route.data['typeuser'] as string;
                console.log('requiredTypeUser:', requiredTypeUser);

                // Verificar si el usuario tiene el tipo requerido
                if (userType && userType === requiredTypeUser) {
                    return true;
                } else {
                    // Redirigir si no es del tipo correcto
                    this.router.navigate(['/home']);
                    return false;
                }
            } catch (error) {
                console.error('Error decodificando el token:', error);
            }
        }

        // Si no hay token, redirigir al login
        this.router.navigate(['/login']);
        return false;
    }
}
