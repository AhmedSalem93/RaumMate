// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <h2>Home Component</h2>
    <button (click)="navigateToProperty()">Navigate to Property</button>
  `,
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToProperty() {
    this.router.navigate(['/property']);
  }
}