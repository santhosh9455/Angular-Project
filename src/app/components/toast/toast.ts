import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent implements OnInit {
  toastVisible = false;
  toastMessage = '';
  toastType: ToastType = 'info';

  private timeoutRef: any;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toastState.subscribe(({ message, type }) => {
      this.toastMessage = message;
      this.toastType = type;
      this.toastVisible = true;

      clearTimeout(this.timeoutRef);
      this.timeoutRef = setTimeout(() => {
        this.toastVisible = false;
      }, 3000);
    });
  }
}
