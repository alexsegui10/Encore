import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { AuthGuard } from '../../core/guards/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [AuthGuard] // Solo clientes autenticados
  },
  {
    path: ':username',
    component: ProfileComponent
    // Sin AuthGuard para permitir ver perfiles sin estar autenticado
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }