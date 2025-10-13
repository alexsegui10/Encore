import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class JwtService {

  getToken(): string {
    const token = window.localStorage['jwtToken'];
    console.log('🔑 Obteniendo token del localStorage:', token ? 'Token encontrado' : 'No hay token');
    return token;
  }

  saveToken(token: string) {
    console.log('💾 Guardando token en localStorage...');
    window.localStorage['jwtToken'] = token;
    console.log('✅ Token guardado correctamente');
  }

  destroyToken() {
    console.log('🗑️ Eliminando token del localStorage...');
    window.localStorage.removeItem('jwtToken');
    console.log('✅ Token eliminado');
  }

}
