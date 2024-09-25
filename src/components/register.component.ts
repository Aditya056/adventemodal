import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  registerType: string | null = null;
  apiErrorMessage: string | null = null;  // To handle error messages

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      trCompanyName: [''],
      gstNo: [''],
      transportLicNo: [''],
      portName: [''],
      address: [''],
      city: [''],
      state: [''],
      country: ['']
    });
  }

  setRegisterType(type: string) {
    this.registerType = type;
    this.registerForm.reset(); // Reset form on register type change
  }

  onRegister() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      if (this.registerType === 'TruckingCompany') {
        this.authService.registerTruckingCompany(registerData).subscribe(
          (response: any) => {
            alert("Registration successful!"); // Show success message in alert box
            this.router.navigate(['/login']); // Redirect back to login page after success
          },
          (error: any) => {
            this.apiErrorMessage = error.error.message;
          }
        );
      } else if (this.registerType === 'Terminal') {
        this.authService.registerTerminal(registerData).subscribe(
          (response: any) => {
            alert("Registration successful!"); // Show success message in alert box
            this.router.navigate(['/login']); // Redirect back to login page after success
          },
          (error: any) => {
            this.apiErrorMessage = error.error.message;
          }
        );
      }
    }
  }

  // Manual back to login
  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
