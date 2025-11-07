import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { UserTypeService } from './core/services/user-type.service';
import { HeaderComponent } from './shared/layout/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  
  constructor(protected userTypeService: UserTypeService) {}

  ngOnInit(): void {
    // El UserTypeService se encarga de llamar al populate correcto
    this.userTypeService.populate();
  }

  get isAdmin() {
    return this.userTypeService.isAdmin();
  }
}
