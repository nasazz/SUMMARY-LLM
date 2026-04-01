import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    'class': 'block h-full w-full'
  }
})
export class App {
  protected readonly title = signal('GEN');

  constructor(private themeService: ThemeService) { }
}
