import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from './shared/product.routing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductsService } from './shared/products.service';
import { DataTablesModule } from 'angular-datatables';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    ProductsRoutingModule,
    InputSwitchModule
  ],
  declarations: [ProductsComponent],
  exports:[
    ProductsRoutingModule
  ],
  providers:[ProductsService]
})
export class ProductsModule { }