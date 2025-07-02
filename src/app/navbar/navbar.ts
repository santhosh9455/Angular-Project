import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule,RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
navigateToDashboard() {
 
}
  private auth = inject(AuthService);
  private router = inject(Router);

  @Input() sidebarCollapsed: boolean = false;
  @Output() toggleSidebarEvent = new EventEmitter<void>();


   toggleSidebar() {
    this.toggleSidebarEvent.emit(); // Notify parent
  }
  
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  logout(): void {
    this.auth.logout();
  }
}
