// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class HomeComponent implements OnInit {
  hasToken = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if token exists in local storage
    this.checkToken();
  }

  checkToken() {
    const token = localStorage.getItem('auth_token');
    this.hasToken = !!token;
  }

  navigateToProperty() {
    this.router.navigate(['/property']);
  }
}
