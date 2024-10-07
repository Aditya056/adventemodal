import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CountryService } from '../services/CountryService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  registerType: string | null = null;
  apiErrorMessage: string | null = null;
  
  countries: { name: string, code: string }[] = [];
  states: { name: string, code: string }[] = [];
  cities: { name: string, code: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
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
      city: [{ value: '', disabled: true }, Validators.required],
      state: [{ value: '', disabled: true }, Validators.required],
      country: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getCountries().subscribe((response: any) => {
      this.countries = response.data.map((country: any) => ({
        name: country.name,
      }));
    });
  }

  onCountryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const countryName = selectElement?.value;

    this.registerForm.get('state')?.setValue('');
    this.registerForm.get('city')?.setValue('');
    this.registerForm.get('state')?.disable();
    this.registerForm.get('city')?.disable();

    if (countryName) {
      this.countryService.getStates(countryName).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.states = response.data.states;
            if (this.states.length > 0) {
              this.registerForm.get('state')?.enable();
            }
          }
        },
        (error: any) => {
          console.error('Failed to load states:', error);
          this.states = [];
          this.registerForm.get('state')?.disable();
        }
      );
    } else {
      this.states = [];
      this.registerForm.get('state')?.disable();
    }
  }

  onStateChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const stateName = selectElement?.value;
    const countryName = this.registerForm.get('country')?.value;

    if (countryName && stateName) {
      this.countryService.getCities(countryName, stateName).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.cities = response.data;
            this.registerForm.get('city')?.enable();
          } else {
            this.cities = [];
            this.registerForm.get('city')?.disable();
          }
        },
        (error: any) => {
          console.error('Failed to load cities:', error);
          this.cities = [];
          this.registerForm.get('city')?.disable();
        }
      );
    } else {
      this.cities = [];
      this.registerForm.get('city')?.disable();
    }
  }

  setRegisterType(type: string) {
    this.registerType = type;
    this.registerForm.reset();
    this.clearValidators();
    this.applyValidators(type);
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
    this.registerForm.updateValueAndValidity();  // Ensure the form recognizes the updated validators
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
          alert(error.error.message || 'Registration failed!');
        }
      );
    } else if (this.registerType === 'Terminal') {
      this.authService.registerTerminal(registerData).subscribe(
        response => {
          alert('Terminal registered successfully!');
          this.router.navigate(['/login']);
        },
        error => {
          alert(error.error.message || 'Registration failed!');
        }
      );
    }
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
