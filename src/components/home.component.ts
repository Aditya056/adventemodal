    import { ChangeDetectorRef, Component } from '@angular/core';
    import { Router } from '@angular/router';
    import { AuthService } from '../services/auth.service';
    import { CommonModule } from '@angular/common';
    import { FormsModule, ReactiveFormsModule } from '@angular/forms';
    import { UniquePipe } from '../app/pipes/unique.pipe';
    import { jsPDF } from 'jspdf';
    

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
      today: string = ''; // To store today's date
      drivers: any[] = [];
      availableSlotsByDate: { [date: string]: number } = {};

      terminals: any[] = [];
      appointments: any[] = []; 
      filteredAppointments: any[] = []; // Appointments filtered by port name for Terminal
      filterStatus: string = ''; // To store the selected status for filtering
      selectedDate: string = ''; // Selected date from the calendar


      showDriverForm = false;
      showAppointmentForm = false;
      showAppointments = true;
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
      minDate: string;
      showDrivers: boolean=false;

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
      availableSlots: { [key: string]: number } = {};

      ngOnInit(): void {
        // Load persisted slots if available
        this.loadSlotsFromStorage();
        
        // Initialize today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        this.today = `${year}-${month}-${day}`;
      }
      
      onDateSelected(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const selectedDate = inputElement.value;
      
        if (selectedDate) {
          this.appointmentDate = selectedDate;
      
          // Check if the date is tracked, if not initialize it with 2 slots
          if (this.availableSlotsByDate[selectedDate] === undefined) {  
            this.availableSlotsByDate[selectedDate] = 2;
          }
      
          // Check slot availability
          const availableSlots = this.availableSlotsByDate[selectedDate];
          if (availableSlots > 0) {
            alert(`Available slots for ${selectedDate}: ${availableSlots}`);
          } else {
            alert(`No slots available for ${selectedDate}.`);
          }
        }
      }
      dateClass() {
        return (date: Date): string => {
          const formattedDate = this.formatDate(date);
          const availableSlots = this.availableSlotsByDate[formattedDate];
    
          // Apply red class if 1 slot is available, green if more than 1, no class otherwise
          if (availableSlots === 1) {
            return 'red-date';
          } else if (availableSlots > 1) {
            return 'green-date';
          } else {
            return ''; // No specific styling
          }
        };
      }
      formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      
      
      clearAppointmentForm() {
        this.selectedDriverId = '';
        this.selectedTerminalId = '';
        this.line = '';
        this.moveType = '';
        this.sizeType = '';
        this.chassisNo = '';
        this.containerNumber = '';
        this.appointmentDate = '';
        this.appointmentTime = '';
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

      constructor(private router: Router, private authService: AuthService, private cdRef: ChangeDetectorRef) {
        const navigation = this.router.getCurrentNavigation();
        this.userData = navigation?.extras?.state?.['userData'];
        this.userType = navigation?.extras?.state?.['userType'];
        const today = new Date();
        this.minDate = today.toISOString().split('T')[0]; 
        // Automatically trigger the relevant method based on user type
        if (this.userType === 'TruckingCompany') {
          this.trCompanyId = this.userData.trCompanyId;
          this.loadAppointments(); // Load appointments for Trucking Company
          this.loadDrivers();
          this.loadTerminals();
        } else if (this.userType === 'Terminal') {
          this.portName = this.userData.portName;
          this.loadTerminalAppointments(); // Load appointments for Terminal
        }
      }

      showManageSlots: boolean = false;
      // Toggle between forms
     // Toggle between forms
     toggleForm(formType: string): void {
      if (formType === 'driver') {
        this.showDriverForm = !this.showDriverForm;
        this.showAppointmentForm = false;
        this.showAppointments = false;
        this.showManageSlots = false;
        this.showDrivers = false; // Ensure drivers view is hidden
      } else if (formType === 'appointment') {
        this.showAppointmentForm = !this.showAppointmentForm;
        this.showDriverForm = false;
        this.showAppointments = false;
        this.showManageSlots = false;
        this.showDrivers = false;
      } else if (formType === 'viewAppointments') {
        this.showAppointments = !this.showAppointments;
        this.showDriverForm = false;
        this.showAppointmentForm = false;
        this.showDrivers = false;
        this.showManageSlots = false;
        if (this.showAppointments) {
          this.loadAppointments();
        }
      } else if (formType === 'viewDrivers') {
        this.showDrivers = !this.showDrivers;
        this.showDriverForm = false;
        this.showManageSlots = false;
        this.showAppointmentForm = false;
        this.showAppointments = false;
        if (this.showDrivers) {
          this.loadDrivers(); // Load driver details
        }
      }else if (formType === 'manageSlots') {
        this.showManageSlots = !this.showManageSlots;
        this.showDriverForm = false;
        this.showAppointmentForm = false;
        this.showAppointments = false;
        this.showDrivers=false;
        if (this.showManageSlots) {
          this.loadSlotsFromStorage(); 
        }
      }

    }
    
    selectedSlotDate: string = '';
   
    // Update slots for the selected date in the Manage Slots form
    updateSlots(): void {
      if (this.selectedSlotDate) {
        // Save the updated slots in localStorage
        this.availableSlotsByDate[this.selectedSlotDate] = this.availableSlotsByDate[this.selectedSlotDate] || 0;
        localStorage.setItem('availableSlotsByDate', JSON.stringify(this.availableSlotsByDate));
        alert(`Slots updated for ${this.selectedSlotDate}`);
        this.toggleForm('manageSlots'); // Close the form
      } else {
        alert("Please select a date to manage slots.");
      }
    }
   
    // Load slots from localStorage
    loadSlotsFromStorage(): void {
      const savedSlots = localStorage.getItem('availableSlotsByDate');
      if (savedSlots) {
        this.availableSlotsByDate = JSON.parse(savedSlots);
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
      this.loading = true;
      this.authService.getDrivers().subscribe(
        (response: any[]) => {
          console.log(response);  // Log the response to check property names
          this.drivers = response.filter(driver => driver.trCompanyId === this.trCompanyId);
          this.loading = false;
        },
        (error) => {
          console.error('Failed to load drivers', error);
          this.loading = false;
        }
      );
    }
    
      // Load appointments for Trucking Company
      loadAppointments() {
        this.loading = true;  // Show the spinner or loading indicator
        this.authService.getAllAppointments().subscribe(
          (response: any[]) => {
            // Filter appointments based on logged-in user's email
            this.appointments = response.filter(appointment => appointment.email === this.userData.email);
            this.showAppointments = true; // Ensure the table is shown after data loads
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
        // Check if all required fields are filled
        if (!this.driverName || !this.plateNo || !this.phoneNumber) {
          this.apiErrorMessage = 'All driver details are required!';
          return;
        }
      
        // Prepare the driver data
        const driverData = {
          driverName: this.driverName,
          plateNo: this.plateNo,
          phoneNumber: this.phoneNumber,
          trCompanyId: this.trCompanyId
        };
      
        // Call the API to add a new driver
        this.authService.addDriver(driverData).subscribe(
          (response) => {
            // Success handler
            console.log('Driver created successfully', response);
            
            // Display the alert box with a success message
            alert('Driver created successfully!');
      // Clear the form fields
            this.clearDriverForm();
            this.showDriverForm = false;
            this.showDrivers = true;  // Show drivers list
            // Reload the drivers list
            this.loadDrivers();
      
            
          },
          (error) => {
            // Error handler
            console.error('Failed to create driver', error);
      
            // Display the error message
            this.apiErrorMessage = error.error?.message || 'Failed to create driver.';
          }
        );
      }
      
      

      // Create a new appointment for the trucking company
      // createAppointment(): void {
      //   if (!this.appointmentDate || !this.selectedDriverId || !this.selectedTerminalId || !this.line || !this.moveType || !this.sizeType || !this.chassisNo || !this.containerNumber) {
      //     alert('Please fill out all the fields before creating the appointment.');
      //     return;
      //   }
      
      //   const availableSlots = this.availableSlotsByDate[this.appointmentDate];
      
      //   if (availableSlots > 0) {
      //     // Prepare the appointment data to send to the API, including TrCompanyId
      //     const appointmentData = {
      //       appointmentDate: this.appointmentDate,
      //       appointmentTime: this.appointmentTime,
      //       driverId: this.selectedDriverId,
      //       terminalId: this.selectedTerminalId,
      //       line: this.line,
      //       moveType: this.moveType,
      //       sizeType: this.sizeType,
      //       chassisNo: this.chassisNo,
      //       containerNumber: this.containerNumber,
      //       trCompanyId: this.trCompanyId  // Add Trucking Company ID
      //     };
      
      //     // Debug: Log appointment data before sending the request
      //     console.log('Appointment Data:', appointmentData);
      
      //     this.authService.bookAppointment(appointmentData).subscribe(
      //       (response) => {
      //         // Decrement the slot count and show a success message
      //         this.availableSlotsByDate[this.appointmentDate] -= 1;
      //         alert('Appointment created successfully!');
      
      //         if (this.availableSlotsByDate[this.appointmentDate] === 0) {
      //           alert(`All slots for ${this.appointmentDate} are now booked.`);
      //         }
      
      //         localStorage.setItem('availableSlotsByDate', JSON.stringify(this.availableSlotsByDate));
      
      //         // Clear the form and close it
      //         this.clearAppointmentForm();
      //         this.showAppointmentForm = false;
      //         this.showAppointments = true;
      
      //         // Optionally, refresh appointments list after booking
      //         this.loadAppointments();
      //       },
      //       (error) => {
      //         console.error('Failed to create appointment:', error);
      //         alert('Failed to create appointment. Please try again.');
      //       }
      //     );
      //   } else {
      //     alert(`No slots available for ${this.appointmentDate}.`);
      //   }
      // }
      

      createAppointment(): void {
        if (!this.appointmentDate || !this.selectedDriverId || !this.selectedTerminalId || !this.line || !this.moveType || !this.sizeType || !this.chassisNo || !this.containerNumber) {
          alert('Please fill out all the fields before creating the appointment.');
          return;
        }
      
        const availableSlots = this.availableSlotsByDate[this.appointmentDate];
      
        if (availableSlots > 0) {
          // Prepare the appointment data to send to the API, including TrCompanyId
          const appointmentData = {
            appointmentDate: this.appointmentDate,
            appointmentTime: this.appointmentTime,
            driverId: this.selectedDriverId,
            terminalId: this.selectedTerminalId,
            line: this.line,
            moveType: this.moveType,
            sizeType: this.sizeType,
            chassisNo: this.chassisNo,
            containerNumber: this.containerNumber,
            trCompanyId: this.trCompanyId  // Add Trucking Company ID
          };
      
          // Debug: Log appointment data before sending the request
          console.log('Appointment Data:', appointmentData);
      
          this.authService.bookAppointment(appointmentData).subscribe(
            (response) => {
              // Decrement the slot count and show a success message
              this.availableSlotsByDate[this.appointmentDate] -= 1;
              alert('Appointment created successfully!');
      
              if (this.availableSlotsByDate[this.appointmentDate] === 0) {
                alert(`All slots for ${this.appointmentDate} are now booked.`);
              }
      
              localStorage.setItem('availableSlotsByDate', JSON.stringify(this.availableSlotsByDate));
      
              // Generate and download the PDF with appointment details
              this.generatePdf(appointmentData);
      
              // Clear the form and close it
              this.clearAppointmentForm();
              this.showAppointmentForm = false;
              this.showAppointments = true;
      
              // Optionally, refresh appointments list after booking
              this.loadAppointments();
            },
            (error) => {
              console.error('Failed to create appointment:', error);
              alert('Failed to create appointment. Please try again.');
            }
          );
        } else {
          alert(`No slots available for ${this.appointmentDate}.`);
        }
      }
      
      // Method to generate and download PDF with appointment details
      generatePdf(appointmentData: any): void {
        const doc = new jsPDF();
      
        // Set PDF title and format content
        doc.text('Appointment Details', 10, 10);
        doc.text(`Appointment Date: ${appointmentData.appointmentDate}`, 10, 20);
        doc.text(`Appointment Time: ${appointmentData.appointmentTime}`, 10, 30);
        doc.text(`Driver ID: ${appointmentData.driverId}`, 10, 40);
        doc.text(`Terminal ID: ${appointmentData.terminalId}`, 10, 50);
        doc.text(`Line: ${appointmentData.line}`, 10, 60);
        doc.text(`Move Type: ${appointmentData.moveType}`, 10, 70);
        doc.text(`Size Type: ${appointmentData.sizeType}`, 10, 80);
        doc.text(`Chassis No: ${appointmentData.chassisNo}`, 10, 90);
        doc.text(`Container Number: ${appointmentData.containerNumber}`, 10, 100);
        doc.text(`Trucking Company ID: ${appointmentData.trCompanyId}`, 10, 110);
      
        // Save and trigger download of the PDF
        doc.save('AppointmentDetails.pdf');
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

            const appointmentTime = this.appointments.find(a => a.appointmentid === appointmentId)?.appointmentTime;
            if (appointmentTime && this.availableSlots[appointmentTime] < 10) {
              this.availableSlots[appointmentTime] += 1;
              localStorage.setItem('availableSlots', JSON.stringify(this.availableSlots)); // Save to localStorage
            }

            this.loadAppointments(); // Refresh the appointments list
            window.location.reload(); 
          },
          (error) => {
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
        this.authService.deleteAppointment(appointmentId).subscribe(
          () => {
            alert('Appointment deleted successfully.');

            const appointmentTime = this.appointments.find(a => a.appointmentid === appointmentId)?.appointmentTime;
            if (appointmentTime && this.availableSlots[appointmentTime] < 10) {
              this.availableSlots[appointmentTime] += 1;
              localStorage.setItem('availableSlots', JSON.stringify(this.availableSlots)); // Save to localStorage
            }

            this.loadAppointments(); 
          },
          (error) => {
            alert('Failed to delete appointment.');
          }
        );
      }
    }
      // // Open the form with the existing appointment details
      
      openEditForm(appointment: any) {
        // Ensure that appointmentId is part of the selected appointment object
        this.selectedAppointment = { ...appointment };  // Spread operator to copy appointment object
    
        // Split the existing appointmentCreated datetime into date and time
        const [date, time] = this.selectedAppointment.appointmentCreated.split('T');
        this.appointmentDate = date;  // Set the date
        this.appointmentTime = time.slice(0, 5);  // Set the time (HH:mm format)
    
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
      //delete driver
      deleteDriver(driver: any) {
        this.driverId =driver.driverId; 
        this.authService.deleteDriver(this.driverId).subscribe(
          () => {
            console.log('Driver deleted successfully');
            this.loadDrivers();  // Refresh the list after deletion
          },
          (error) => {
            console.error('Failed to delete driver', error);
            this.apiErrorMessage = 'Failed to delete driver. Please try again.';
          }
        );
      }
      updateDriver() {
        const updatedDriver = {
          driverName: this.driverName,
          phoneNumber: this.phoneNumber,
          plateNo: this.plateNo,  // Plate number remains the same
          trCompanyId: this.trCompanyId,
          driverId:this.driverId
        };
      
        this.authService.updateDriver(this.driverId, updatedDriver).subscribe(
          (response) => {
            console.log('Driver updated successfully', response);
            this.showUpdateDriverForm = false;  // Close the update form
            this.loadDrivers();  // Refresh the list after update
          },
          (error) => {
            console.error('Failed to update driver', error);
            this.apiErrorMessage = 'Failed to update driver. Please try again.';
          }
        );
      }
      
      showUpdateDriverForm:boolean=false;
      driverId:any=null;
      editDriver(driver: any) {
        this.showUpdateDriverForm = true;
        this.showDriverForm = false;  // Hide the "Add New Driver" form
        this.driverId = driver.driverId;  // Store the driver's ID for update
        this.driverName = driver.driverName;  // Pre-fill the name
        this.phoneNumber = driver.phoneNumber;  // Pre-fill the phone number
        this.plateNo = driver.plateNo;  // Show but don't allow plate number to change
      }
      cancelUpdateDriver()
      {
        this.showUpdateDriverForm=false;
      }
      
    }
