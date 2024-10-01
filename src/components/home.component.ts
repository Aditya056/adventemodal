import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UniquePipe } from '../app/pipes/unique.pipe';

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
  appointments: any[] = []; 
  filteredAppointments: any[] = []; // Appointments filtered by port name for Terminal

  showDriverForm = false;
  showAppointmentForm = false;
  showAppointments = false;
  loading: boolean = false; // For loading spinner
  apiErrorMessage: string | null = null;
  availableTimes = [
    { value: '01:00', display: '1:00 AM' },
    { value: '02:00', display: '2:00 AM' },
    { value: '03:00', display: '3:00 AM' },
    { value: '04:00', display: '4:00 AM' },
    { value: '05:00', display: '5:00 AM' },
    { value: '06:00', display: '6:00 AM' },
    { value: '07:00', display: '7:00 AM' },
    { value: '08:00', display: '8:00 AM' },
    { value: '09:00', display: '9:00 AM' },
    { value: '10:00', display: '10:00 AM' },
    { value: '11:00', display: '11:00 AM' },
    { value: '12:00', display: '12:00 PM' },
    { value: '13:00', display: '1:00 PM' },
    { value: '14:00', display: '2:00 PM' },
    { value: '15:00', display: '3:00 PM' },
    { value: '16:00', display: '4:00 PM' },
    { value: '17:00', display: '5:00 PM' },
    { value: '18:00', display: '6:00 PM' },
    { value: '19:00', display: '7:00 PM' },
    { value: '20:00', display: '8:00 PM' },
    { value: '21:00', display: '9:00 PM' },
    { value: '22:00', display: '10:00 PM' },
    { value: '23:00', display: '11:00 PM' },
    { value: '00:00', display: '12:00 AM' }
  ];
  
  
  portName: string = ''; // Terminal-specific field
  email: string = ''; // Terminal-specific field
  trCompanyId: string | null = null;
  appointmentCreated: string = '';  
  appointmentDate: string = '';  // Store the selected date
  appointmentTime: string = '';  // Store the selected time (hours)
  appointmentAmPm: string = 'AM';  // Store AM/PM selector

  // Method to convert time to 24-hour format
  private convertTo24HourFormat(time: string, period: string): string {
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0; // Handle 12 AM case
    }
    return `${hours.toString().padStart(2, '0')}:${minutes ? minutes.toString().padStart(2, '0') : '00'}`;
  }


  // Form fields
  driverName: string = '';
  plateNo: string = '';
  phoneNumber: string = '';
  hours: number[] = Array.from({ length: 24 }, (_, i) => i + 1); // Generates hours from 1 to 24
  appointmentHour: number = 0; // Store the selected hour

  selectedDriverId: string = '';
  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  selectedTerminalId: string = '';
  filterDate: string = '';  // New property for filtering by date
  line: string = '';
  moveType: string = '';
  sizeType: string = '';
  chassisNo: string = '';
  containerNumber: string = '';
  appointmentDateTime: string = ''; // Store the selected date and time
  isEditing: boolean = false; // To manage edit state
  
  filteredStates: string[] = [];
  filteredCities: string[] = [];
  filteredPorts: any[] = [];

  constructor(private router: Router, private authService: AuthService,private cdRef: ChangeDetectorRef) {
    const navigation = this.router.getCurrentNavigation();
    this.userData = navigation?.extras?.state?.['userData'];
    this.userType = navigation?.extras?.state?.['userType'];

    // Display information for Terminal or Trucking Company
    if (this.userType === 'TruckingCompany') {
      this.trCompanyId = this.userData.trCompanyId;
      this.loadDrivers();
      this.loadTerminals();
    } else if (this.userType === 'Terminal') {
      this.portName = this.userData.portName;
      this.email = this.userData.email;
      this.loadTerminalAppointments(); // Load appointments related to the terminal's port
    }
  }

  // Toggle between forms
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
  loadTerminals() {
    this.authService.getTerminals().subscribe(
      (response) => {
        this.terminals = response;
        // Optionally, you can initialize the filteredStates based on the terminals data
        this.filteredStates = this.getUniqueStates(this.terminals);
      },
      (error) => {
        console.error('Failed to load terminals', error);
      }
    );
  }

  // Load drivers for the trucking company
  loadDrivers() {
    this.authService.getDrivers().subscribe(
      (response) => {
        // Assuming response is an array of objects, explicitly type driver as `any`
        this.drivers = response.filter((driver: any) => driver.trCompanyId === this.trCompanyId);
      },
      (error) => {
        console.error('Failed to load drivers', error);
      }
    );
  }
  
  

  // Load appointments for Trucking Company
  loadAppointments() {
    this.loading = true;
    this.authService.getAllAppointments().subscribe(
      (response: any[]) => {
        // Filter appointments based on logged-in user's email
        this.appointments = response.map(appointment => {
          return {
            appointmentId: appointment.appointmentId,
            appointmentCreated: new Date(appointment.appointmentCreated), // Convert date properly
            moveType: appointment.moveType, // Move type (e.g. pick/drop)
            sizeType: appointment.sizeType, // Size type (e.g. full/empty)
            terminalId: appointment.terminalId, // Port/Terminal Id
            // Add other properties you need to display
            ...appointment
          };
        }).filter(appointment => 
          appointment.email === this.userData.email
        );
        
        this.loading = false;
      },
      (error) => {
        console.error('Failed to load appointments', error);
        this.apiErrorMessage = 'Failed to load appointments.';
        this.loading = false;
      }
    );
  }


  // Load appointments for Terminal based on port name
  loadTerminalAppointments() {
    this.loading = true;
    this.authService.getAllAppointments().subscribe(
      (response: any[]) => {
        this.filteredAppointments = response.filter(appointment => 
          appointment.portName === this.portName
        );
        this.loading = false;
      },
      (error) => {
        console.error('Failed to load terminal appointments', error);
        this.apiErrorMessage = 'Failed to load appointments.';
        this.loading = false;
      }
    );
  }

  // Create a new driver for the trucking company
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
        this.loadDrivers();
        this.clearDriverForm();
      },
      (error) => {
        console.error('Failed to create driver', error);
        this.apiErrorMessage = error.error?.message || 'Failed to create driver.';
      }
    );
  }
  

  // Create a new appointment for the trucking company
  createAppointment() {
    // Validate form inputs, including appointment date and time
    if (!this.selectedDriverId || !this.selectedTerminalId || !this.line || !this.moveType || !this.sizeType || !this.chassisNo || !this.containerNumber || !this.appointmentDate || !this.appointmentTime) {
      this.apiErrorMessage = 'Please fill out all fields, including the appointment date and time, before booking an appointment.';
      return;
    }
  
    // Combine appointment date and time
    const combinedDateTime = `${this.appointmentDate}T${this.appointmentTime}:00`;
  
    // Prepare the appointment data
    const appointmentData = {
      trcompanyid: this.trCompanyId,
      terminalid: this.selectedTerminalId,
      driverid: this.selectedDriverId,
      Line: this.line,
      MoveType: this.moveType,
      SizeType: this.sizeType,
      ChassisNo: this.chassisNo,
      ContainerNumber: this.containerNumber,
      appointmentCreated: combinedDateTime // Use the combined datetime input
    };
  
    // Make API call to book the appointment
    this.authService.bookAppointment(appointmentData).subscribe(
      (response) => {
        alert('Appointment created successfully!');
        location.reload();  // Optionally reload the page after successful creation
      },
      (error) => {
        // Handle error and display an appropriate message
        this.apiErrorMessage = error.error?.message || 'Failed to create appointment.';
      }
    );
  }
  
  getUniqueStates(terminals: any[]): string[] {
    return terminals
      .map(terminal => terminal.state)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  // Clear form fields for creating a new driver
  clearDriverForm() {
    this.driverName = '';
    this.plateNo = '';
    this.phoneNumber = '';
  }

  // Navigate back to login
  goBackToLogin() {
    this.router.navigate(['/login']);
  }

  // Filtering methods
  filterStates() {
    this.filteredStates = this.terminals
      .filter(terminal => terminal.country === this.selectedCountry)
      .map(terminal => terminal.state)
      .filter((value, index, self) => self.indexOf(value) === index);
    this.selectedState = '';
    this.filteredCities = [];
    this.filteredPorts = [];
  }

  filterCities() {
    this.filteredCities = this.terminals
      .filter(terminal => terminal.state === this.selectedState)
      .map(terminal => terminal.city)
      .filter((value, index, self) => self.indexOf(value) === index);
    this.selectedCity = '';
    this.filteredPorts = [];
  }

  filterPorts() {
    this.filteredPorts = this.terminals.filter(terminal => terminal.city === this.selectedCity);
  }

  // Number input validation
  isNumber(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateNumber(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const numberRegex = /^[0-9]*$/;
    if (!numberRegex.test(inputElement.value)) {
      inputElement.value = inputElement.value.replace(/\D/g, '');
    }
  }
 // home.component.ts

 cancelAppointment(appointmentId: number) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    this.authService.cancelAppointment(appointmentId).subscribe(
      (response) => {
        alert('Appointment cancelled successfully.');

        window.location.reload(); // Refresh the page after successful cancellation
      },
      (error) => {
        console.error('Failed to cancel appointment', error);
        this.apiErrorMessage = error.error?.message || 'Failed to cancel appointment.';
      }
    );
  }
}
// filterAppointmentsByDate() {
//   if (this.filterDate) {
//     setTimeout(() => {
//       // Parse the selected filter date from 'dd-MM-yyyy' to 'yyyy-MM-dd' (standard date input format)
//       const selectedDate = new Date(this.filterDate);
      
//       this.filteredAppointments = this.appointments.filter(appointment => {
//         // Extract and format the appointmentCreated date to 'yyyy-MM-dd' for comparison
//         const appointmentDate = new Date(appointment.appointmentCreated);

//         // Compare both dates by setting hours, minutes, and seconds to 0 (to compare only date part)
//         return appointmentDate.setHours(0, 0, 0, 0) === selectedDate.setHours(0, 0, 0, 0);
//       });
//     }, 100); // Add a 100ms delay to ensure everything is updated before filtering
//   } else {
//     // Show all appointments if no date is selected
//     this.filteredAppointments = this.appointments;
    
//   }
// }


// filterAppointmentsByDate() {
//   if (this.filterDate) {
//     const selectedDate = new Date(this.filterDate);
//     this.filteredAppointments = this.appointments.filter(appointment => {
//       const appointmentDate = new Date(appointment.appointmentCreated);
//       return appointmentDate.setHours(0, 0, 0, 0) === selectedDate.setHours(0, 0, 0, 0);
//     });

//     // Manually detect changes
//     this.cdRef.detectChanges();
//   } else {
//     this.filteredAppointments = this.appointments;
//   }
// }
filterAppointmentsByDate() {
  if (this.filterDate) {
    // Convert the selected date to 'YYYY-MM-DD' format
    const selectedDate = this.filterDate; // Angular's date input already gives 'YYYY-MM-DD'

    // Call the API with the formatted date
    this.authService.getAppointmentsByDate(selectedDate).subscribe(
      (response) => {
        this.filteredAppointments = response;
      },
      (error) => {
        if (error.status === 404) {
          // Show an alert if no appointments are found
          alert('No appointments found for the selected date.');
        } else {
          console.error('Failed to filter appointments by date', error);
          this.apiErrorMessage = 'Failed to filter appointments by date.';
        }
      }
    );
  } else {
    // Show all appointments if no date is selected
    this.filteredAppointments = this.appointments;
  }
}




selectedAppointment: any = null; // Holds the selected appointment

// Delete appointment
  deleteAppointment(appointmentId: number) {
    if (confirm("Are you sure you want to delete this appointment?")) {
      this.loading = true;
      this.authService.deleteAppointment(appointmentId).subscribe(
        () => {
          alert('Appointment deleted successfully.');
          this.loadAppointments();
          this.loading = false;
        },
        (error) => {
          console.error('Failed to delete appointment', error);
          alert('Failed to delete appointment.');
          this.loading = false;
        }
      );
    }
  }
  // Open the form with the existing appointment details
  openEditForm(appointment: any) {
    // Ensure that appointmentId is part of the selected appointment object
    this.selectedAppointment = { ...appointment };  // Spread operator to copy appointment object
    
    console.log('Editing Appointment:', this.selectedAppointment);  // Debugging log
  }
  
  

  // Close the form
  closeEditForm() {
    this.selectedAppointment = null;
  }

  // Handle the form submission
  onSubmit() {
    // Debugging log to see if appointmentId exists
    console.log('Submitting Appointment:', this.selectedAppointment);
  
    // Check if selectedAppointment and its appointmentId are defined
    if (this.selectedAppointment && this.selectedAppointment.appointmentid) {
      const appointmentId = this.selectedAppointment.appointmentid;
  
      // Prepare the updated appointment object
      const updatedAppointment = { ...this.selectedAppointment };
  
      // Call the update method and subscribe to the response
      this.authService.updateAppointment(appointmentId, updatedAppointment)
        .subscribe(
          (response) => {
            alert('Appointment updated successfully.');
            this.closeEditForm();
            window.location.reload(); 
          },
          (error) => {
            console.error('Failed to update appointment:', error);
            alert('Failed to update appointment.');
          }
        );
    } else {
      console.error('Appointment ID is missing');
      alert('Failed to update appointment: Appointment ID is missing.');
    }
  }
  
  

  // API call to update the appointment
  updateAppointment(appointmentId: number, updatedAppointment: any) {
    this.authService.updateAppointment(appointmentId, updatedAppointment).subscribe(
      () => {
        alert('Appointment updated successfully.');
        this.loadAppointments(); // Reload appointments after update
      },
      (error) => {
        console.error('Failed to update appointment', error);
        alert('Failed to update appointment.');
      }
    );
  }
  
}
