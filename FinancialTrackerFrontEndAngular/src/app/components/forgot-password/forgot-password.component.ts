// forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: false
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      this.forgotPasswordForm.disable();

      this.authService.forgotPassword(this.forgotPasswordForm.value.email)
        .subscribe({
          next: (response) => {
            this.success = 'Password reset instructions have been sent to your email';
            this.error = '';
            this.forgotPasswordForm.reset();
            this.forgotPasswordForm.enable();
            this.isLoading = false;
          },
          error: (err) => {
            this.error = err.error?.message || 'Error processing request';
            this.success = '';
            this.forgotPasswordForm.enable();
            this.isLoading = false;
          }
        });
    }
  }
}