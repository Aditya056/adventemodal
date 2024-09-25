import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UniquePipe } from './pipes/unique.pipe';  // Import the pipe


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UniquePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Fixed typo from 'styleUrl' to 'styleUrls'
})
export class AppComponent {
  title = 'adventclient';
}
