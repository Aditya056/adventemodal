import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;
  apiErrorMessage: string | null = null;
notRobot: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      userType: ['', Validators.required]  // User type: TruckingCompany or Terminal
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.authService.login(loginData).subscribe(
        (response: any) => {
          // Store JWT token and trucking company ID (if TruckingCompany)
          localStorage.setItem('token', response.token);
          if (loginData.userType === 'TruckingCompany') {
            localStorage.setItem('trCompanyId', response.data.trCompanyId);
          }

          // Navigate to home page and pass user data to HomeComponent
          this.router.navigate(['/home'], { state: { userData: response.data, userType: loginData.userType } });
        },
        (error: any) => {
          this.apiErrorMessage = error.error.message;
          console.error('Login failed', error);
        }
      );
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
