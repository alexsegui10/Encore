import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EnterpriseAuthService } from '../../../core/services/enterprise-auth.service';
import { UserTypeService } from '../../../core/services/user-type.service';
import { NgxHaloComponent } from '@omnedia/ngx-halo';

@Component({
  selector: 'app-enterprise-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxHaloComponent],
  templateUrl: './enterprise-login.component.html',
  styleUrls: ['./enterprise-login.component.css']
})
export class EnterpriseLoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private enterpriseAuthService: EnterpriseAuthService,
    private userTypeService: UserTypeService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.enterpriseAuthService.login(credentials).subscribe({
      next: () => {
        this.userTypeService.updateRole();
        this.router.navigate(['/enterprise/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || err.message || 'Error en el login';
      }
    });
  }
}
