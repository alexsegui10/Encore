import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { UserService } from './core/services/user.service';
import { HeaderComponent } from './shared/layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
    constructor(private userService: UserService) {}

  ngOnInit(): void {
  }
}
