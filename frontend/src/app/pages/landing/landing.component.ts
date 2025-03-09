import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [RouterModule, CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  cities = [
    { name: 'Berlin', listings: 120 },
    { name: 'Munich', listings: 85 },
    { name: 'Hamburg', listings: 95 },
    { name: 'Frankfurt', listings: 60 }
  ];

  listings = [
    { id: 1, title: 'Cozy Apartment in Berlin', location: 'Berlin, Mitte', price: 450, image: 'https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 2, title: 'Shared Room in Munich', location: 'Munich, Schwabing', price: 380, image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 3, title: 'Studio in Hamburg', location: 'Hamburg, Altona', price: 600, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 4, title: 'Shared Room in Munich', location: 'Munich, Schwabing', price: 380, image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
  ];
}
