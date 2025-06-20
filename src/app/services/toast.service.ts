import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toastState = new Subject<{ message: string; type: ToastType }>();

  showSuccess(message: string) {
    this.toastState.next({ message, type: 'success' });
  }

  showError(message: string, err?: any) {
    this.toastState.next({ message, type: 'error' });
  }

  showInfo(message: string) {
    this.toastState.next({ message, type: 'info' });
  }
}
