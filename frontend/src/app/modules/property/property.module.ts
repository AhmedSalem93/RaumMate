import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Ensure this is imported
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
import { PropertyRoutingModule } from './property-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule, // ✅ Ensure this is imported
    PropertyRoutingModule,
    PropertyListComponent,
    PropertyDetailComponent
  ]
})
export class PropertyModule { }
