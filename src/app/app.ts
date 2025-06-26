import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast';
import { Navbar } from './navbar/navbar';
import { LoadingComponent } from "./components/loading-component/loading-component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, Navbar, ToastComponent, LoadingComponent], 
  styleUrls: ['./app.css'], 
  templateUrl: './app.html'
})
export class App {
  protected title = 'srsApp';
}
