import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EnterpriseAuthService } from '../../../core/services/enterprise-auth.service';

@Component({
  selector: 'app-enterprise-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './enterprise-dashboard.component.html',
  styleUrls: ['./enterprise-dashboard.component.css']
})
export class EnterpriseDashboardComponent implements OnInit {
  currentEnterprise$;
  sidebarOpen = true;

  constructor(
    private enterpriseAuthService: EnterpriseAuthService,
    private router: Router
  ) {
    this.currentEnterprise$ = this.enterpriseAuthService.currentEnterprise$;
  }

  ngOnInit(): void {
    this.enterpriseAuthService.populate();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.enterpriseAuthService.logout();
    this.router.navigate(['/enterprise/login']);
  }
}
