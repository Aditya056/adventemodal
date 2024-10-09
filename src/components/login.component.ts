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
isLoading: boolean = false;  // Add this flag for the loader


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      userType: ['', Validators.required]  // User type: TruckingCompany or Terminal
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;  // Show the loader

      const loginData = this.loginForm.value;
      this.authService.login(loginData).subscribe(
        (response: any) => {
          // Store JWT token
          localStorage.setItem('token', response.token);

          // Store necessary details based on user type
          if (loginData.userType === 'TruckingCompany') {
            localStorage.setItem('trCompanyId', response.data.trCompanyId);
          } else if (loginData.userType === 'Terminal') {
            localStorage.setItem('portName', response.data.portName);
          }

          // Trigger navigation after showing loader for 5 seconds
          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/home'], { state: { userData: response.data, userType: loginData.userType } });
          }, 3000);  // Show the loading animation for 5 seconds
        },
        (error: any) => {
          this.isLoading = false;
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
