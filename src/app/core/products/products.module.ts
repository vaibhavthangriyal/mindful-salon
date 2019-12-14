import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from './shared/product.routing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductsService } from './shared/products.service';
import { DataTablesModule } from 'angular-datatables';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CategoryComponent } from './category/category.component';
import { BrandComponent } from './brand/brand.component';
import { AttributesComponent } from './attributes/attributes.component';
import { AttributesService } from './attributes/shared/attributes.service';
import { TypesComponent } from './types/types.component';
import { ProductTypeService } from './types/shared/product.types.service';
import { Select2Module } from 'ng2-select2';
import { OptionsComponent } from './options/options.component';
import { ProductOptionService } from './options/shared/product.types.service';
import { ProductsCategoryService } from './category/shared/category.service';
import { ProductVarientService } from './shared/product.varient.service';
import { NgxGalleryModule } from 'ngx-gallery';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    ProductsRoutingModule,
    InputSwitchModule,
    Select2Module,
    NgxGalleryModule
  ],
  declarations: [ProductsComponent, CategoryComponent, BrandComponent, AttributesComponent, TypesComponent, OptionsComponent],
  exports: [
    ProductsRoutingModule
  ],
  providers: [
    ProductsService,
    AttributesService,
    ProductTypeService,
    ProductOptionService,
    ProductsCategoryService,
    ProductVarientService
  ]
})
export class ProductsModule { }
