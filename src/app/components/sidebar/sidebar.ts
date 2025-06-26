import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Input() userRoles: string[] = [];
  @Output() sectionChange = new EventEmitter<string>();
  @Input() collapsed: boolean = false;
  @Input() activeSection: string | null = null;


  hasRole(role: string): boolean {
  return Array.isArray(this.userRoles) && this.userRoles.includes(role);
}


  selectSection(section: string) {
    this.activeSection = section; // ← mark active
    this.sectionChange.emit(section);
  }
}
