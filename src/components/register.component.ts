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
  apiErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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
    this.registerForm.reset(); // Reset form fields
    this.clearValidators(); // Clear validators before applying new ones
    this.applyValidators(type); // Apply validators based on selected type
  }

  applyValidators(type: string) {
    if (type === 'TruckingCompany') {
      this.registerForm.get('trCompanyName')?.setValidators([Validators.required]);
      this.registerForm.get('gstNo')?.setValidators([Validators.required]);
      this.registerForm.get('transportLicNo')?.setValidators([Validators.required]);
    } else if (type === 'Terminal') {
      this.registerForm.get('portName')?.setValidators([Validators.required]);
      this.registerForm.get('address')?.setValidators([Validators.required]);
      this.registerForm.get('city')?.setValidators([Validators.required]);
      this.registerForm.get('state')?.setValidators([Validators.required]);
      this.registerForm.get('country')?.setValidators([Validators.required]);
    }
    this.registerForm.updateValueAndValidity(); // Update form validity
  }

  clearValidators() {
    this.registerForm.get('trCompanyName')?.clearValidators();
    this.registerForm.get('gstNo')?.clearValidators();
    this.registerForm.get('transportLicNo')?.clearValidators();
    this.registerForm.get('portName')?.clearValidators();
    this.registerForm.get('address')?.clearValidators();
    this.registerForm.get('city')?.clearValidators();
    this.registerForm.get('state')?.clearValidators();
    this.registerForm.get('country')?.clearValidators();
  }

  onRegister() {
    if (this.registerForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    const registerData = this.registerForm.value;

    if (this.registerType === 'TruckingCompany') {
      this.authService.registerTruckingCompany(registerData).subscribe(
        response => {
          alert('Company registered successfully!');
          this.router.navigate(['/login']);
        },
        error => {
          this.apiErrorMessage = error.error.message || 'Registration failed!';
        }
      );
    } else if (this.registerType === 'Terminal') {
      this.authService.registerTerminal(registerData).subscribe(
        response => {
          alert('Terminal registered successfully!');
          this.router.navigate(['/login']);
        },
        error => {
          this.apiErrorMessage = error.error.message || 'Registration failed!';
        }
      );
    }
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
