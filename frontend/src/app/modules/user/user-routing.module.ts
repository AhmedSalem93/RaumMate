import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { CompleteProfileComponent } from './complete-profile/complete-profile.component';

const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
