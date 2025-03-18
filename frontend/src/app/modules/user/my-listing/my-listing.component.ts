import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { SlidebarComponent } from '../../../shared/components/slidebar/slidebar.component';
import { CommonModule } from '@angular/common';
import { Property } from '../../../shared/models/property.model';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'app-my-listing',
  imports: [CommonModule, SlidebarComponent, PropertyCardComponent],
  templateUrl: './my-listing.component.html',
  styleUrl: './my-listing.component.scss'
})
export class MyListingComponent implements OnInit {
  user: any = null;
  reviews: any[] = [];
  defaultProfilePicture: string = 'https://avatars.githubusercontent.com/u/47269252?v=1';
  properties: Property[] = [];

  constructor(private userService: UserService, private router: Router, private reviewService: ReviewService, private propertyService: PropertyService) { }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/auth/login']);
    }
    this.userService.getProfile().subscribe(user => {
      if (!user.profileCompleted) {
        this.router.navigate(['user/complete-profile']);
      }
    });
    this.userService.getProfile().subscribe( user => {
      this.user = user;
      this.propertyService.getMyProperties(this.user._id).subscribe(properties => {
        this.properties = properties;
        console.log('properties: ' + properties.length);
      })
    });
    this.reviewService.getUserReviews(this.user.userId).subscribe(reviews => { this.reviews = reviews;});
  }
}