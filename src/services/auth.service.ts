import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5232/api';  // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Helper function to get the stored JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Login method (No token required)
  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, loginData, {
      params: { userType: loginData.userType }    });
  }

  // Register Trucking Company (No token required)
  registerTruckingCompany(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registration/truckingcompany`, data);
  }

  // Register Terminal (No token required)
  registerTerminal(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registration/terminal`, data);
  }
  public getUserType(): string | null {
    return localStorage.getItem('userType');
  }
  
  public getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Fetch drivers for the trucking company with Authorization header
  getDrivers(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });

    return this.http.get(`${this.apiUrl}/driver`, { headers });
  }

  // Add new driver with Authorization header
  addDriver(driverData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });

    return this.http.post(`${this.apiUrl}/driver`, driverData, { headers });
  }
  getAppointmentsByDate(date: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });
  
    return this.http.get(`${this.apiUrl}/appointment/search?filterDate=${date}`, { headers });
  }
  

  // Fetch terminals for appointment with Authorization header
  getTerminals(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });

    return this.http.get(`${this.apiUrl}/appointment/terminals`, { headers });
  }

  // Book an appointment with Authorization header
  bookAppointment(appointmentData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });

    return this.http.post(`${this.apiUrl}/appointment/create`, appointmentData, { headers });
  }
  getAllAppointments(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });
  
    return this.http.get(`${this.apiUrl}/appointment/all`, { headers });
  }
  deleteAppointment(appointmentId: number): Observable<any> {
    const token = this.getToken(); // Assuming token is stored in local storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });
  
    return this.http.delete(`${this.apiUrl}/appointment/delete/${appointmentId}`, { headers });
  }
  cancelAppointment(appointmentId: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });

    // Using PUT instead of DELETE for canceling appointment
    return this.http.put(`${this.apiUrl}/appointment/cancel/${appointmentId}`, null, { headers });
  }
  updateAppointment(appointmentId: number, updatedAppointment: any): Observable<any> {
    const token = this.getToken(); // Assuming token is stored in local storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add JWT token to headers
    });
  
    // Construct the correct API URL with the appointmentId
    const url = `${this.apiUrl}/appointment/update/${appointmentId}`;
  
    // Return the result of the PUT request as an Observable
    return this.http.put(url, updatedAppointment, { headers });
  }
  
  getAllDrivers(): Observable<any[]> {
    const token = this.getToken();  // Retrieve the JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add the JWT token to the headers
    });
  
    return this.http.get<any[]>('http://localhost:5232/api/driver', { headers });  // Make the request with headers
  }
  deleteDriver(driverId: number): Observable<any> {
    const token = this.getToken();  // Retrieve the JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add the JWT token to the headers
    });
    
    return this.http.delete(`http://localhost:5232/api/driver/${driverId}`, { headers });  // Make the delete request with headers
  }
  
  updateDriver(driverId: number, driverData: any): Observable<any> {
    const token = this.getToken();  // Retrieve the JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add the JWT token to the headers
    });
  
    return this.http.put(`http://localhost:5232/api/driver/${driverId}`, driverData, { headers });  // Make the put request with headers
  }
  
  
  
  
  
  
  
}
