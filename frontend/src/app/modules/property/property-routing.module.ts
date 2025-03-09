import { CreatePropertyComponent } from './create-property/create-property.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';

const routes: Routes = [
  { path: '', component: PropertyListComponent, pathMatch: 'full' },
  { path: 'create', component: CreatePropertyComponent },
  { path: ':id', component: PropertyDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes), CreatePropertyComponent],
  exports: [RouterModule, CreatePropertyComponent],
})
export class PropertyRoutingModule {}
