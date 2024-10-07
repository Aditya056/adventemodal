// country.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countriesUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private http: HttpClient) {}

  // Fetch list of countries
  getCountries(): Observable<any> {
    return this.http.get(`${this.countriesUrl}/positions`);
  }

  // Fetch states based on country name
  getStates(country: string): Observable<any> {
    return this.http.post(`${this.countriesUrl}/states`, { country });
  }

  // Fetch cities based on country and state
  getCities(country: string, state: string): Observable<any> {
    return this.http.post(`${this.countriesUrl}/state/cities`, { country, state });
  }
}
