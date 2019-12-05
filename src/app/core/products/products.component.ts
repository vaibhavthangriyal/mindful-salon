import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ProductsService } from './shared/products.service';
import { FormBuilder, FormGroup, FormControlName, Validators, FormArray, FormControl } from '@angular/forms';
import { ProductModel, CategoryModel } from './shared/product.model';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ResponseModel } from '../../shared/shared.model';
import * as _ from 'lodash';
import value from '*.json';
import { Title } from '@angular/platform-browser';
import { ProductTypeService } from './types/shared/product.types.service';
import { ProductTypeModel } from './types/shared/product.types.model';
import { AttributesService } from './attributes/shared/attributes.service';
import { ProductOptionService } from './options/shared/product.types.service';
import { ProductVarientService } from './shared/product.varient.service';
import { validateBasis } from '@angular/flex-layout';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit {
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;
  @ViewChildren('selectallcheckboxes') selectallcheckboxes: QueryList<ElementRef>;
  @ViewChildren('selectallcheckboxes') selectallcheckboxes2: any;
  @ViewChildren('checkboxes') checkboxes2: any;
  fileSelected: any;
  imageUrl = 'https://sgsmarketing.s3.ap-south-1.amazonaws.com/';
  jQuery: any;
  allproducts: any[] = [];
  allCategories: CategoryModel[] = [];
  allProductTypes: any[] = [];
  checkboxesForm: FormGroup;
  currentproduct: any;
  currentproductId: String;
  currentIndex: number;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  editing: Boolean = false;
  varientEditing: Boolean = false;
  productForm: FormGroup;
  allBrand: any[] = [];
  array: any[] = [];
  countArray: any[] = [];
  array2: any = [];
  array3: any[] = [];
  masterArray: any[] = [];
  keyProductImage: any;
  urlProductImage: any;
  showImage: Boolean = false;
  image: any;
  editShowImage: Boolean = false;
  editImage: any;
  mastImage: any;
  newStock: Number;
  optionArray: FormArray;
  pattern = '^[0-9]*$';
  productAttributeArray: string[] = [];
  productImagesArray: any[] = [];
  productOptionsArray: any[] = [];
  productType: ProductTypeModel;
  productVarient: FormGroup;
  selectIndex: Number = 0;
  submitted: Boolean = false;
  uploading: Boolean = false;
  varientArray: any[] = [];
  allSubCategories: any[] = [];
  allSubCategories2: any[] = [];
  allSubCategories3: any[] = [];
  allSubCategories4: any[] = [];
  allSubCategories5: any[] = [];
  subCategory1: any;
  subCategory2: any;
  subCategory3: any;
  subCategory4: any;
  allCategoryArray: any[] = [];
  constructor(
    private productService: ProductsService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private titleService: Title,
    private typeService: ProductTypeService,
    private productAttributeService: AttributesService,
    private productOptionService: ProductOptionService,
    private productVarientService: ProductVarientService
  ) {
    this.titleService.setTitle('Product Management');
    this.initForm();
  }

  ngOnInit() {
    this.getProducts();
    this.getAllCategory();
    this.getallBrand();
    this.getAllProductTypes();
    this.initCheckboxesForm();
    this.initProductVarientForm();
  }
  //  *********************** INIT FUNCTIONS ************************
  initDatatable() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [10, 15, 25, -1],
        [10, 15, 25, 'All']
      ],
      destroy: true,
      retrive: true,
      // dom: "<'html5buttons'B>lTfgitp",
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      }, initComplete: function (settings, json) {
        $('.button').removeClass('dt-button');
      },
      dom: 'l  f r t i p',
      // dom:"B<'#colvis row'><'row'><'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-4'i>><'row'p>",
      // buttons: [
      //   {
      //     text: 'Excel',
      //     extend: 'excel',
      //     className: 'table-button btn btn-sm button btn-danger '
      //   },
      //   {
      //     extend: 'print',
      //     text: 'Print',
      //     className: 'table-button btn-sm button btn btn-danger '
      //   },
      //   {
      //     extend: 'pdf',
      //     text: 'PDF',
      //     className: 'table-button btn-sm button btn btn-danger '
      //   }
      // ]
    };
  }

  initForm() {
    this.productForm = this.formBuilder.group({
      brand: ['', Validators.required],
      category: ['', Validators.required],
      details: [''],
      is_active: [false],
      name: ['', Validators.required],
      base_price: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(1)]],
      image: [''],
      type: ['']
    });
  }

  initCheckboxesForm() {
    this.checkboxesForm = this.formBuilder.group({
      options_id: this.formBuilder.array([])
    });
  }

  initProductVarientForm() {
    this.productVarient = this.formBuilder.group({
      product: [''],
      attributes: this.formBuilder.array([]),
      name: ['', Validators.required],
      sku_id: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required]
    });
  }
  // ************************** GET FUNCTIONS *********************
  get f() { return this.productForm.controls; }
  get getOptionsForm() { return this.productVarient.get('attributes')['controls'] as FormArray; }

  getAllCategory() {
    this.productService.getAllCategory().subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error While Fetching', 'Error');
      } else {
        this.allCategories = res.data;
      }
    });
  }

  getProducts() {
    this.allproducts.length = 0;
    this.productService.getAllProduct().subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error While Fetcing Products', 'Refresh and Retry');
      } else {
        this.allproducts = res.data;
        this.dtTrigger.next();
        if (res.data) {
          for (var i = 0; i < res.data.length; i++) {
            this.productImagesArray.push(this.imageUrl + res.data[i].image);
          }
        }
      }
    });
  }

  getallBrand() {
    this.productService.getAllBrand().subscribe((res: ResponseModel) => {
      this.allBrand = res.data;
    });
  }

  getAllProductTypes() {
    this.typeService.getAllProductType().subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toastr.error('Error While Fetching Product Type', 'Refresh and Retry');
      } else {
        this.allProductTypes = res.data;
      }
    });
  }

  getAllProductAttbsributes() {
    this.productAttributeArray.length = 0;
    const productAttributeIdArray: string[] = [];
    if (this.currentproduct.type) {
      if (this.currentproduct.type.attributes) {
        this.currentproduct.type.attributes.forEach(element => {
          productAttributeIdArray.push(element._id);
        });
        console.log(this.currentproduct);
        this.productOptionService.getAllOptionsOfAttributes(productAttributeIdArray).subscribe((res: ResponseModel) => {
          if (res.errors) {
            this.toastr.error('Error While Fetching Product Attributes', 'Refresh and Retry');
          } else {
            this.productAttributeArray = res.data;
            const attributeCount = res.data.length;
            this.generateFormControlForOptions(attributeCount);
          }
        });
      }
    }
  }

  getAllSubCategory1() {
    this.productForm.get('category').setValue(this.subCategory1);
    // this.allCategoryArray.push(this.subCategory1);
    this.productService.getAllCategorysub(this.subCategory1).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error getting Categories', 'Try Again');
      } else {
        if (res.data[0].subcategory.length > 0) {
          this.allCategoryArray.push(this.subCategory1);
          this.allSubCategories = res.data[0].subcategory;
        } else {
          this.toastr.info('No Sub Categories Found');
        }
        // this.productForm.get('category').setValue(this.subCategory1);
      }
    });
  }

  getAllSubCategory2() {
    if (this.subCategory2) {
      // this.allCategoryArray.push(this.subCategory2);
      this.productForm.get('category').setValue(this.subCategory2);
      // this.productForm.get('category').setValue(this.subCategory1);
      // this.productForm.get('subcategories').setValue(this.allCategoryArray);
      this.productService.getAllCategorysub(this.subCategory2).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toastr.error('Error getting Categories', 'Try Again');
        } else {
          if (res.data[0].subcategory.length > 0) {
            this.allCategoryArray.push(this.subCategory2);
            this.allSubCategories2 = res.data[0].subcategory;
          } else {
            this.toastr.info('No Sub Categories Found');
          }
        }
      });
    }
  }

  getAllSubCategory3() {
    // this.allCategoryArray.push(this.subCategory3);
    if (this.subCategory3) {
      this.productForm.get('category').setValue(this.subCategory3);
      // this.productForm.get('subcategories').setValue(this.allCategoryArray);
      this.productService.getAllCategorysub(this.subCategory3).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toastr.error('Error getting Categories', 'Try Again');
        } else {
          if (res.data[0].subcategory.length > 0) {
            this.allCategoryArray.push(this.subCategory3);
            this.allSubCategories3 = res.data[0].subcategory;
          } else {
            this.toastr.info('No Sub Categories Found');
          }
        }
      });
    }
  }

  getAllSubCategory4() {
    // this.allCategoryArray.push(this.subCategory4);
    if (this.subCategory4) {
      this.productForm.get('category').setValue(this.subCategory4);
      this.productService.getAllCategorysub(this.subCategory4).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toastr.error('Error getting Categories', 'Try Again');
        } else {
          if (res.data[0].subcategory.length > 0) {
            this.allCategoryArray.push(this.subCategory4);
            this.allSubCategories4 = res.data[0].subcategory;
          } else {
            this.toastr.info('No Sub Categories Found');
          }
        }
      });
    }
  }

  getAllVarientsOfProduct() {
    this.varientArray.length = 0;
    this.productVarientService.getAllVarientsOfProduct(this.currentproduct._id).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Unable to Fetch Varients', 'Refresh and Retry');
      } else {
        this.varientArray = res.data;
        console.log(this.varientArray);
      }
    });
  }
  // ************************** ADD FUNCTIONS *****************************
  addProduct(product) {
    this.productService.addProduct(product).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error While Adding !', 'Error!');
      } else {
        jQuery('#modal3').modal('hide');
        this.toastr.success('Product Added!', 'Success!');
        this.allproducts.push(res.data);
        this.resetForm();
      }
    });
  }

  addOptions(): void {
    this.optionArray = this.productVarient.get('attributes') as FormArray;
    this.optionArray.push(this.createAttribute());
  }
  // ************************** UPDATE FUNCTIONS *****************************
  updateProduct(product) {
    const id = this.allproducts[this.currentIndex]._id;
    this.productService.updateProduct(product, id).subscribe((res: ResponseModel) => {
      jQuery('#modal3').modal('hide');
      this.toastr.info('Product Updated Successfully!', 'Updated!!');
      this.resetForm();
      this.allproducts.splice(this.currentIndex, 1, res.data);
      this.currentproductId = null;
      this.editing = false;
      this.masterArray.length = 0;
    });
  }

  updateProductStock() {
    this.productService.updateProductStock({ id: this.currentproduct._id, newStock: this.newStock }).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.warning('Error', 'Stock Not Updated');
      } else {
        this.allproducts.splice(this.currentIndex, 1, res.data);
        this.toastr.success('Updated', 'Stock Updated');
        jQuery('#stockModal').modal('hide');
        this.newStock = 0;
      }
    });
  }
  // ************************** DELETE FUNCTIONS *****************************
  deleteProduct(i) {
    if (confirm('You Sure you want to delete this Product')) {
      this.productService.deleteProduct(this.allproducts[i]._id).toPromise().then(() => {
        this.toastr.warning('Products Deleted!', 'Deleted!');
        this.allproducts.splice(i, 1);
      }).catch((err) => console.log(err));
    }
  }
  // ************************** SUBMIT FUNCTIONS *****************************
  submit() {
    this.productForm.get('type').setValue(this.productType);
    this.submitted = true;
    if (this.productForm.invalid) {
      return;
    } else {

    }
    if (this.fileSelected) {
      this.productService.getUrlProduct().subscribe((res: ResponseModel) => {
        this.keyProductImage = res.data.key;
        this.urlProductImage = res.data.url;
        if (this.urlProductImage) {
          this.productService.sendUrlProduct(this.urlProductImage, this.fileSelected)
            .then(resp => {
              if (resp.status === 200) {
                this.productForm.value.image = this.keyProductImage;
                if (this.editing) {
                  this.updateProduct(this.productForm.value);
                } else {
                  this.addProduct(this.productForm.value);
                }
              }
            });
        }
      });
    } else {
      if (this.editing) {
        if (!this.fileSelected) {
          this.productForm.value.image = this.mastImage;
        }
        this.updateProduct(this.productForm.value);

      } else {
        delete this.productForm.value.image;
        this.addProduct(this.productForm.value);
      }
    }
  }

  saveVarient() {
    this.productVarient.value.product = this.currentproduct._id;
    const attribute = this.productVarient.value.attributes;
    console.log(this.productVarient);
    console.log(attribute);
    for (let index = 0; index < attribute.length; index++) {
      attribute[index].attribute = attribute[index].option.parent;
      attribute[index].option = attribute[index].option._id;
    }
    console.log(this.productVarient.value);
    this.productVarientService.addNewProductVarients(this.productVarient.value).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error While Adding Varient', 'Refresh And Retry');
      } else {
        this.toastr.success('Varient Added Successfully', 'Success');
        this.varientArray.push(res.data);
        jQuery('#varientModal').modal('hide');
        this.emptyOptionFormAray();
      }
    });
  }
  // ************************** RESET FUNCTIONS *****************************
  resetForm() {
    this.editing = false;
    this.submitted = false;
    this.productForm.reset();
    this.editShowImage = false;
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
    this.selectallcheckboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
  }

  emptyOptionFormAray() {
    this.initProductVarientForm();
  }
  // ************************** CALCULATION FUNCTIONS *****************************

  selectFile(event: any) {
    this.fileSelected = event.target.files[0];
  }

  editProduct(i) {
    this.editing = true;
    this.currentproduct = this.allproducts[i];
    this.currentproductId = this.allproducts[i]._id;
    this.currentIndex = i;
    this.setFormValue();
  }

  viewProduct(i) {
    this.array3.length = 0;
    this.currentproduct = this.allproducts[i];
    console.log(this.productVarient);
    if (this.currentproduct.varients) { this.varientEditing = true; }
    if (this.currentproduct.image) {
      this.showImage = true;
      this.image = this.imageUrl + this.currentproduct.image;
    } else {
      this.showImage = false;
    }
    if (this.array3.length > 0) {
      jQuery('#exampleModal').modal('show');
    }
    this.getAllProductAttbsributes();
    this.getAllVarientsOfProduct();
  }

  setFormValue() {
    const product: any = this.allproducts[this.currentIndex];
    this.productForm.controls['brand'].setValue(product.brand._id);
    this.productForm.controls['category'].setValue(product.category._id);
    this.productForm.controls['details'].setValue(product.details);
    this.productForm.controls['is_active'].setValue(product.is_active);
    this.productForm.controls['name'].setValue(product.name);
    this.productForm.controls['base_price'].setValue(product.base_price);
    this.productForm.controls['type'].setValue(product.type._id);
    // this. = product.type;
    if (product.image) {
      this.editShowImage = true;
      this.mastImage = product.image;
      this.editImage = this.imageUrl + product.image;
    } else {
      this.editShowImage = false;
    }
  }

  checkboxChange(_id: string, isChecked: boolean) {
    const checkBoxArray = <FormArray>this.checkboxesForm.controls.options_id;
    if (isChecked) {
      checkBoxArray.push(new FormControl(_id));
    } else {
      const index = checkBoxArray.controls.findIndex(x => x.value === _id);
      checkBoxArray.removeAt(index);
    }
    this.selectallcheckboxes = checkBoxArray.value;
  }

  createAttribute(): FormGroup {
    return this.formBuilder.group({
      option: [''],
      attribute: ['']
    });
  }

  generateFormControlForOptions(attributeCount) {
    for (let index = 0; index < attributeCount; index++) {
      this.addOptions();
    }
  }

  editVarient(i: number) {
    // console.log(i);
    // const updateVaientArray :any[] = []
    // updateVaientArray.push({att})
    // this.productVarientService.updateProductVarients({attri})
  }

  deleteVarient(index: number) {
    if (confirm('Are You Sure You Want To Delete The Selected Varient?')) {
      this.productVarientService.deleteProductVarients(this.varientArray[index]._id).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toastr.error('Error While Deleting Varient');
        } else {
          this.varientArray.splice(index, 1);
          this.toastr.success('Varient Deleted Succesfully');
        }
      })
    }
  }
}
