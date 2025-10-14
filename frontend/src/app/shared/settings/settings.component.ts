import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-settings-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
    user: User = {} as User;
    settingsForm: FormGroup;
    errors: Object = {};
    isSubmitting = false;

    constructor(
        private router: Router,
        private userService: UserService,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef
    ) {
        this.settingsForm = this.fb.group({
            image: '',
            username: '',
            bio: '',
            email: '',
            password: ''
        });
    }

    ngOnInit() {
        // Obtener el usuario actual del servicio
        Object.assign(this.user, this.userService.getCurrentUser());
        // Rellenar el formulario con los datos del usuario
        this.settingsForm.patchValue(this.user);
        this.cd.markForCheck();
    }

    logout() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Cerrar sesión
                this.userService.purgeAuth();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión cerrada',
                    text: '¡Hasta pronto!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    this.router.navigateByUrl('/');
                });
            }
        });
    }

    submitForm() {
        this.isSubmitting = true;
        this.cd.markForCheck();

        // Actualizar los datos del usuario con los valores del formulario
        this.updateUser(this.settingsForm.value);

        // Enviar la actualización al servidor
        this.userService.update(this.user).subscribe({
            next: (updatedUser) => {
                this.isSubmitting = false;
                this.cd.markForCheck();
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Tus datos se han actualizado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    this.router.navigateByUrl('/profile/' + updatedUser.username);
                });
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errors = err.error?.errors || {};
                this.cd.markForCheck();
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron actualizar los datos. Por favor, inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }

    updateUser(values: Object) {
        // Actualizar solo los campos que no están vacíos
        Object.keys(values).forEach(key => {
            const value = (values as any)[key];
            // Si el campo no está vacío, actualizar el usuario
            if (value !== '' && value !== null && value !== undefined) {
                (this.user as any)[key] = value;
            }
        });
    }
}
