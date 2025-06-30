import { Component } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast';
import { LoadingComponent } from "./components/loading-component/loading-component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, ToastComponent, LoadingComponent,FormsModule],
  styleUrls: ['./app.css'],
  templateUrl: './app.html'
})
export class App {
  protected title = 'srsApp';
}
