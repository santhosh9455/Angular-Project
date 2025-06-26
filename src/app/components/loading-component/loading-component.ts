import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-component',
  imports: [CommonModule],
  templateUrl: './loading-component.html',
  styleUrl: './loading-component.css',
  standalone: true
})
export class LoadingComponent {
   constructor(public loader: LoadingService) {}

}
