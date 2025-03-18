import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
  properties: any[] = [];
  reviews: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadProperties();
    this.loadReviews();
  }
  // Load Users
  loadUsers() {
    this.adminService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }
  // Update User
  updateUser(user: any) {
    this.adminService.updateUser(user._id, user).subscribe(() => {
      this.loadUsers();
    });
  }
  // Delete User
  deleteUser(user: any) {
    this.adminService.deleteUser(user._id).subscribe(() => {
      this.loadUsers();
    });
  }

  // Load Properties
  loadProperties() {
    this.adminService.getProperties().subscribe((properties) => {
      this.properties = properties;
    });
  }

  // Verify Property
  verifyProperty(property: any) {
    this.adminService.verifyProperty(property._id).subscribe(() => {
      this.loadProperties();
    });
  }

  // Reject Property
  rejectProperty(property: any) {
    this.adminService.rejectProperty(property._id).subscribe(() => {
      this.loadProperties();
    });
  }

  // Load Reviews
  loadReviews() {
    this.adminService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
    });
  }

  // Approve Review
  approveReview(review: any) {
    this.adminService.approveReview(review._id).subscribe(() => {
      this.loadReviews();
    });
  }

  // Reject Review
  rejectReview(review: any) {
    this.adminService.rejectReview(review._id).subscribe(() => {
      this.loadReviews();
    });
  }
}
