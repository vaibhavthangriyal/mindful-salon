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
import { Title, DomSanitizer } from '@angular/platform-browser';
import { ProductTypeService } from './types/shared/product.types.service';
import { ProductTypeModel } from './types/shared/product.types.model';
import { AttributesService } from './attributes/shared/attributes.service';
import { ProductOptionService } from './options/shared/product.types.service';
import { ProductVarientService } from './shared/product.varient.service';
import { validateBasis } from '@angular/flex-layout';
import { NgxGalleryImage, NgxGalleryAnimation, NgxGalleryOptions } from 'ngx-gallery';
import { element } from '@angular/core/src/render3/instructions';

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
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  fileSelected: any;
  imageUrl = 'https://sgsmarketing.s3.ap-south-1.amazonaws.com/';
  jQuery: any;
  allproducts: any[] = [];
  allCategories: CategoryModel[] = [];
  allProductTypes: any[] = [];
  checkboxesForm: FormGroup;
  attributesForm: FormGroup;
  currentproduct: any;
  currentproductId: String;
  currentIndex: number;
  currentVarientPrimaryImageURL: string = 'http://www.internetgardener.com.au/wp-content/uploads/2016/02/dummy-product.jpg';
  currentVarientSecondaryyImageURL: string = 'http://www.internetgardener.com.au/wp-content/uploads/2016/02/dummy-product.jpg';
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
  imageFormData: FormData = new FormData();
  editShowImage: Boolean = false;
  editImage: any;
  newStock: Number;
  mastImage: any;
  currentVarient: any;
  optionArray: FormArray;
  pattern = '^[0-9]*$';
  productAttributeArray: any[] = [];
  productFormData: FormData = new FormData();
  varientFormData: FormData;
  productImagesArray: any[] = [];
  productOptionsArray: any[] = [];
  productType: ProductTypeModel;
  productVarient: FormGroup;
  selectIndex: Number = 0;
  submitted: Boolean = false;
  uploading: Boolean = false;
  varientArray: any[] = [];
  varientIndex: number;
  varientUpdate: Boolean = false;
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
  showSellingPrice: Boolean = false;
  uploadingImages: Boolean = false;
  constructor(
    private productService: ProductsService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private titleService: Title,
    private typeService: ProductTypeService,
    private productAttributeService: AttributesService,
    private productOptionService: ProductOptionService,
    private productVarientService: ProductVarientService,
    private sanitizer: DomSanitizer
  ) {
    this.titleService.setTitle('Mindful Salon | Product Management');
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
      image: [''],
      type: [''],
      is_service: [false]
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
      // name: ['', Validators.required],
      description: ['', Validators.required],
      images: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required]
    });
  }

  initGallery(photos) {
    this.galleryOptions = [
      {
        imageSize: 'containe',
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
    const imageArray: any[] = [];
    for (let index = 0; index < photos.length; index++) {
      const imageObject: { small: String, medium: String, big: String } = { small: '', medium: '', big: '' };
      imageObject.small = 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + photos[index];
      imageObject.medium = 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + photos[index];
      imageObject.big = 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + photos[index];
      imageArray.push(imageObject);
    }
    this.galleryImages = imageArray;
    console.log(this.galleryImages);
    // if (this.galleryImages.length > 0) {
    //   this.imagesPresent = true;
    // } else {
    //   this.imagesPresent = false;
    // }
  }

  reRenderDatatable() {
    jQuery('#mainTable').DataTable().destroy();
    this.dtTrigger.next();
  }

  // ************************** GET FUNCTIONS *********************
  get f() { return this.productForm.controls; }
  // get getOptionsForm() { return this.productVarient'controls' as FormArray; }

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
        console.log(this.allproducts);
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
        this.productOptionService.getAllOptionsOfAttributes(productAttributeIdArray).subscribe((res: ResponseModel) => {
          if (res.errors) {
            this.toastr.error('Error While Fetching Product Attributes', 'Refresh and Retry');
          } else {
            this.productAttributeArray = res.data;
          }
        });
      }
    }
  }

  getAllSubCategory1() {
    this.productForm.get('category').setValue(this.subCategory1);
    this.allSubCategories.length = 0;
    this.allSubCategories2.length = 0;
    this.allSubCategories3.length = 0;
    this.allSubCategories4.length = 0;
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
        this.allproducts.push(res.data);
        this.reRenderDatatable();
        this.toastr.success('Product Added!', 'Success!');
        jQuery('#modal3').modal('hide');
        this.resetForm();
      }
    });
  }

  // ************************** UPDATE FUNCTIONS *****************************
  updateProduct(product) {
    const id = this.allproducts[this.currentIndex]._id;
    this.productService.updateProduct(product, id).subscribe((res: ResponseModel) => {
      jQuery('#modal3').modal('hide');
      this.toastr.info('Product Updated Successfully!', 'Updated!!');
      this.allproducts.splice(this.currentIndex, 1, res.data);
      this.currentproductId = null;
      this.editing = false;
      this.masterArray.length = 0;
      this.reRenderDatatable();
    });
    this.resetForm();
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
        this.reRenderDatatable();
      }).catch((err) => console.log(err));
    }
  }

  deleteVarient(index: number) {
    if (confirm('Are You Sure You Want To Delete The Selected Varient?')) {
      this.productVarientService.deleteProductVarients(this.varientArray[index]._id).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toastr.error('Error While Deleting Varient');
        } else {
          this.varientArray.splice(index, 1);
          this.toastr.warning('Varient Deleted Succesfully');
        }
      });
    }
  }
  // ************************** SUBMIT FUNCTIONS *****************************
  submit() {
  }

  saveVarient() {
    if (this.varientUpdate === false) {
      this.productVarient.value.product = this.currentproduct._id;
      const attribute = this.productVarient.value.attributes;
      for (let index = 0; index < attribute.length; index++) {
        this.productVarient.value.attributes[index].attribute = this.productAttributeArray[index]._id;
      }
      this.productVarientService.addNewProductVarients(this.productVarient.value).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toastr.error('Error While Adding Varient', 'Refresh And Retry');
        } else {
          this.toastr.success('Varient Added Successfully', 'Success');
          this.varientArray.push(res.data);
          jQuery('#addVarientModal').modal('hide');
        }
      });
    } else {
      this.productVarient.removeControl('product');
      for (let i = 0; i < this.currentVarient.attributes.length; i++) {
        this.productVarient.value.attributes[i].attribute = this.currentVarient.attributes[i].attribute._id;
      }
      this.varientFormData = new FormData();
      this.varientFormData.append('product', this.productVarient.get('product').value);
      this.varientFormData.append('attributes', this.productVarient.get('attributes').value);
      this.varientFormData.append('description', this.productVarient.get('description').value);
      this.varientFormData.append('price', this.productVarient.get('price').value);
      this.varientFormData.append('stock', this.productVarient.get('stock').value);
      this.varientFormData.append('images', this.productVarient.get('images').value);
      this.productVarientService.updateProductVarients(this.currentVarient._id, this.varientFormData)
        .subscribe((res: ResponseModel) => {
          if (res.errors) {
            this.toastr.error('Error While Deleting Varient');
          } else {
            this.varientArray = res.data;
            jQuery('#addVarientModal').modal('hide');
            this.toastr.info('Varient Updated Succesfully');
          }
        });
    }
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
    this.productFormData = new FormData();
    this.currentVarient = undefined;
    this.currentproduct = undefined;
  }

  resetProductVarientForm() {
    this.initProductVarientForm();
    for (let index = 0; index < this.productAttributeArray.length; index++) {
      this.addAttributes();
    }
    this.varientUpdate = false;
  }

  // ************************** CALCULATION FUNCTIONS *****************************

  selectFile(event: any, type) {
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
    this.productForm.controls['type'].setValue(product.type._id);
    this.productForm.controls['is_service'].setValue(product.is_service);
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

  editVarient(index: number) {
    this.initProductVarientForm();
    this.currentVarient = this.varientArray[index];
    this.varientIndex = index;
    this.setVarientImages();
    this.initGallery(this.currentVarient.images);
    console.log(this.currentVarient);
    this.varientUpdate = true;
    if (this.currentVarient.name) {
      this.productVarient.controls['name'].setValue(this.currentVarient.name);
    }
    if (this.currentVarient.price) {
      this.productVarient.controls['price'].setValue(this.currentVarient.price);
    }
    if (this.currentVarient.sku_id) {
      this.productVarient.controls['sku_id'].setValue(this.currentVarient.sku_id);
    }
    if (this.currentVarient.stock) {
      this.productVarient.controls['stock'].setValue(this.currentVarient.stock);
    }
    if (this.currentVarient.description) {
      this.productVarient.controls['description'].setValue(this.currentVarient.description);
    }
    if (this.currentVarient.attributes) {
      for (let i = 0; i < this.currentVarient.attributes.length; i++) {
        const attribute = this.formBuilder.group({
          attribute: [],
          option: this.currentVarient.attributes[i].option._id
        });
        this.currentProductAttributesForms.push(attribute);
        console.log(attribute);
      }
    }
  }

  // ************************** FORMARRAY FUNCTIONS *****************************

  get currentProductAttributesForms() {
    return this.productVarient.get('attributes') as FormArray;
  }

  addAttributes() {
    const attribute = this.formBuilder.group({
      attribute: [],
      option: []
    });
    this.currentProductAttributesForms.push(attribute);
  }

  selectedServiceType(event) {
    if (event.target.value === 'service') {
      this.showSellingPrice = false;
    } else if (event.target.value === 'product') {
      this.showSellingPrice = true;
    }
  }

  appFormDataFuntion(data) {
    for (let index = 0; index < data.length; index++) {
      console.log(data[index]);
    }
  }

  onSelectFile(event, type) {
    console.log(type);
    if (event.target.files && event.target.files[0]) {
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        this.imageFormData.append(type, event.target.files[i]);
      }
    }
  }

  onProductImageSelect(event, type) {
    console.log(type);
    if (event.target.files && event.target.files[0]) {
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        this.productFormData.append(type, event.target.files[i]);
      }
    }
  }

  uploadImages() {
    this.uploadingImages = true;
    this.productService.uploadVarientImages(this.currentVarient._id, this.imageFormData).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error While Uploading Images', 'Try Again ');
        this.uploadingImages = false;
        this.imageFormData = new FormData();
      } else {
        console.log(res.data);
        this.varientArray.splice(this.varientIndex, 1, res.data);
        this.setVarientImages();
        this.toastr.success('Images Uploaded Successfully');
        this.uploadingImages = false;
        jQuery('#imageModal').modal('hide');
        this.imageFormData = new FormData();
      }
    });
  }

  uploadProductImages() {
    this.uploadingImages = true;
    this.productService.uploadVarientImages(this.currentVarient._id, this.imageFormData).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toastr.error('Error While Uploading Images', 'Try Again ');
        this.uploadingImages = false;
        this.imageFormData = new FormData();
      } else {
        console.log(res.data);
        this.varientArray.splice(this.varientIndex, 1, res.data);
        this.setVarientImages();
        this.toastr.success('Images Uploaded Successfully');
        this.uploadingImages = false;
        jQuery('#imageModal').modal('hide');
        this.imageFormData = new FormData();
      }
    });
  }

  setVarientImages() {
    // if (this.currentVarient.images) {
    //   if (this.currentVarient.images.primary) {
    //     document.getElementById('imagePreviewPrimary').style.background =
    //       'url(' + 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + this.currentVarient.images.primary + ') ';
    //     // this.currentVarientPrimaryImageURL = this.currentVarient.images.primary;
    //   }
    //   if (this.currentVarient.images.secondary) {
    //     document.getElementById('imagePreviewSecondary').style.background =
    //       'url(' + 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + this.currentVarient.images.secondary + ') ';
    //   }
    // }
  }
}

