import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UniquePipe } from './pipes/unique.pipe';  // Import the pipe
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'; // Ensure FormsModule is imported for ngModel to work
import { CommonModule } from '@angular/common'; // Required for basic Angular directives like ngIf, ngFor

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    UniquePipe, 
    MatDatepickerModule, 
    MatInputModule, 
    MatNativeDateModule, 
    MatFormFieldModule, 
    FormsModule, 
    CommonModule // Add CommonModule for structural directives
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent {
  title = 'adventclient';
}
