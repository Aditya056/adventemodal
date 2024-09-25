import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UniquePipe } from '../app/pipes/unique.pipe';
import { Appointment } from '../models/appointment.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UniquePipe],
  standalone: true
})
export class HomeComponent {
  userType: string | null = null;
  userData: any;
  drivers: any[] = [];
  terminals: any[] = [];
  filteredStates: any[] = [];
  filteredCities: any[] = [];
  filteredPorts: any[] = [];

  appointments: any[] = []; // Add this line for appointments
  showAppointments: boolean = false; // Add this line to control appointment view

  // Form state
  showDriverForm = false;
  showAppointmentForm = false;
  loading: boolean = false; // Define loading property


  // Driver form fields
  driverName: string = '';
  plateNo: string = '';
  phoneNumber: string = '';

  // Appointment form fields
  selectedDriverId: string = '';
  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  selectedTerminalId: string = '';
  line: string = '';
  moveType: string = '';
  sizeType: string = '';
  chassisNo: string = '';
  containerNumber: string = '';

  trCompanyId: string | null = null;
  apiErrorMessage: string | null = null;

  constructor(private router: Router, private authService: AuthService) {
    const navigation = this.router.getCurrentNavigation();
    this.userData = navigation?.extras?.state?.['userData'];
    this.userType = navigation?.extras?.state?.['userType'];

    // Fetch the trucking company ID from the login response
    if (this.userType === 'TruckingCompany') {
      this.trCompanyId = this.userData.trCompanyId;
      this.loadDrivers();
      this.loadTerminals(); // Load terminals for the port selection
    }
  }
  deleteAppointment(appointmentId: number) {
    if (confirm("Are you sure you want to delete this appointment?")) {
      this.loading = true; // Show loading spinner or message (optional)
      
      this.authService.deleteAppointment(appointmentId).subscribe(
        (response) => {
          alert('Appointment deleted successfully.');
          this.loadAppointments(); // Reload the appointments list after deletion
          this.loading = false; // Hide loading spinner or message
        },
        (error) => {
          console.error('Failed to delete appointment', error);
          alert('Failed to delete appointment.');
          this.loading = false; // Hide loading spinner or message
        }
      );
    }
  }
  
  

  // Toggle between driver form and appointment form
  toggleForm(formType: string) {
    if (formType === 'driver') {
      this.showDriverForm = !this.showDriverForm;
      this.showAppointmentForm = false;
      this.showAppointments = false;
    } else if (formType === 'appointment') {
      this.showAppointmentForm = !this.showAppointmentForm;
      this.showDriverForm = false;
      this.showAppointments = false;
    } else if (formType === 'viewAppointments') {
      this.showAppointments = !this.showAppointments;
      this.showDriverForm = false;
      this.showAppointmentForm = false;
  
      if (this.showAppointments) {
        this.loadAppointments();
      }
    }
  }
  
  
  // Load drivers for the trucking company and display their plate numbers
  loadDrivers() {
    this.authService.getDrivers().subscribe(
      (response) => {
        this.drivers = response;
      },
      (error) => {
        console.error('Failed to load drivers', error);
      }
    );
  }
  loadAppointments() {
    this.loading = true; // Show loading spinner or message
    this.authService.getAllAppointments().subscribe(
      (response: any[]) => {
        // Filter appointments where email matches the logged-in trucking company email
        const truckingCompanyEmail = this.userData.email; // Get the logged-in trucking company email
        this.appointments = response.filter(appointment => 
          appointment.email === truckingCompanyEmail
        );
        this.loading = false; // Hide loading spinner or message after filtering
      },
      (error) => {
        console.error('Failed to load appointments:', error);
        this.apiErrorMessage = 'Failed to load appointments.';
        this.loading = false; // Hide loading on error
      }
    );
  }
  
  
  
  
  // Load terminals for filtering by country, state, and city
  loadTerminals() {
    this.authService.getTerminals().subscribe(
      (response) => {
        this.terminals = response;
        this.filteredStates = this.getUniqueStates(this.terminals);  // Load initial states
      },
      (error) => {
        console.error('Failed to load terminals', error);
      }
    );
  }

  // Method to filter states based on the selected country
  filterStates() {
    this.filteredStates = this.terminals
      .filter(terminal => terminal.country === this.selectedCountry)
      .map(terminal => terminal.state)
      .filter((value, index, self) => self.indexOf(value) === index);  // Get unique states

    this.selectedState = ''; // Reset state selection when country changes
    this.filteredCities = []; // Clear filtered cities when country changes
    this.filteredPorts = []; // Clear filtered ports when country changes
  }

  // Method to filter cities based on the selected state
  filterCities() {
    this.filteredCities = this.terminals
      .filter(terminal => terminal.state === this.selectedState)
      .map(terminal => terminal.city)
      .filter((value, index, self) => self.indexOf(value) === index);  // Get unique cities

    this.selectedCity = '';  // Reset city selection when state changes
    this.filteredPorts = []; // Clear filtered ports when state changes
  }

  // Method to filter ports based on the selected city
  filterPorts() {
    this.filteredPorts = this.terminals.filter(terminal => terminal.city === this.selectedCity);
  }

  // Restrict container number input to only numbers
  isNumber(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Validate the input in case of pasted values or autocomplete
  validateNumber(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const numberRegex = /^[0-9]*$/;  // Allow only digits
    if (!numberRegex.test(inputElement.value)) {
      inputElement.value = inputElement.value.replace(/\D/g, '');  // Replace non-numeric characters
    }
  }

  // Create a new driver (truck)
  createTruck() {
    if (!this.driverName || !this.plateNo || !this.phoneNumber) {
      this.apiErrorMessage = 'All driver details are required!';
      return;
    }

    const driverData = {
      driverName: this.driverName,
      plateNo: this.plateNo,
      phoneNumber: this.phoneNumber,
      trCompanyId: this.trCompanyId
    };

    this.authService.addDriver(driverData).subscribe(
      (response) => {
        console.log('Driver created successfully', response);
        this.loadDrivers(); // Reload the drivers list after creating the truck
        this.clearDriverForm();
      },
      (error) => {
        console.error('Failed to create driver', error);
        this.apiErrorMessage = error.error?.message || 'Failed to create driver.';
      }
    );
  }

  // Add a new appointment
// Add this method in your HomeComponent
createAppointment() {
  // Validate form inputs
  if (!this.selectedDriverId || !this.selectedTerminalId || !this.line || !this.moveType || !this.sizeType || !this.chassisNo || !this.containerNumber) {
    this.apiErrorMessage = 'Please fill out all fields before booking an appointment.';
    return;
  }

  // Prepare appointment data
  const appointmentData = {
    trcompanyid: this.trCompanyId,
    terminalid: this.selectedTerminalId,
    driverid: this.selectedDriverId,
    Line: this.line,
    MoveType: this.moveType,
    SizeType: this.sizeType,
    ChassisNo: this.chassisNo,
    ContainerNumber: this.containerNumber
  };

  // Create appointment through the API
  this.authService.bookAppointment(appointmentData).subscribe(
    (response) => {
      console.log('Appointment created successfully', response);
      alert('Appointment created successfully!'); // Show success alert
      location.reload(); // Refresh the page
    },
    (error) => {
      this.apiErrorMessage = error.error?.message || 'Failed to create appointment.'; // Display API error
    }
  );
}


  // Utility function to get unique states from terminals
  getUniqueStates(terminals: any[]): string[] {
    return terminals.map(terminal => terminal.state)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  // Clear the add driver form fields
  clearDriverForm() {
    this.driverName = '';
    this.plateNo = '';
    this.phoneNumber = '';
  }

  // Navigate back to login
  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
