import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';

const routes: Routes = [
  { path: '', component: PropertyListComponent },  // This must be present
  { path: ':id', component: PropertyDetailComponent }  // Example dynamic route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutingModule { }
