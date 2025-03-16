import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { CompleteProfileComponent } from './complete-profile/complete-profile.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { MyListingComponent } from './my-listing/my-listing.component';

const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'view-profile/:email', component:  ViewProfileComponent},
  { path: 'my-listing', component: MyListingComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
