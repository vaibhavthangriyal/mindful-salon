import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ProductsService } from '../shared/products.service';
import { ResponseModel } from '../../../shared/shared.model';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
  imageUrl = "https://binsar.s3.ap-south-1.amazonaws.com/"
  brandForm: FormGroup;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  editing: boolean = false;
  submitted: boolean = false;
  allBrand: any[] = [];
  viewArray: any = [];
  currentBrand: any;
  currentBrandId: any;
  currentIndex: number
  fileSelected: any;
  keyProductImage: any;
  urlProductImage: any;
  showImage: boolean = false;
  image: any;
  editShowImage: boolean = false;
  editImage: any;
  mastImage: any;
  brandImage: any;
  filenameBrandImage: string | ArrayBuffer;
  constructor(private formBuilder: FormBuilder, private productService: ProductsService, private toastr: ToastrService,
    private titleService: Title) {
    this.titleService.setTitle('Brand Management');
    this.getAllBrand();
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: "full_numbers",
      lengthMenu: [
        [10, 15, 25, -1],
        [10, 15, 25, 'All']
      ],
      destroy: true,
      retrive: true,
      // dom: '<"html5buttons"B>lTfgitp',
      language: {
        search: "_INPUT_",
        searchPlaceholder: "Search records",
      }, initComplete: function (settings, json) {
        $('.button').removeClass('dt-button');
      },
      dom: "l f r t i p",
      // dom: "l <'bottom'B> f r t i p",
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
    this.brandForm = this.formBuilder.group({
      name: ['', Validators.required],
      logo: [''],
      contact: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  rerenderDatatable() {
    jQuery('#mainTable').DataTable().destroy();
    this.dtTrigger.next();
  }

  get f() { return this.brandForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.brandForm.invalid) {
      return;
    }
    const formData = new FormData();
    if (this.editing) {
      if (this.brandImage) {
        formData.append('logo', this.brandImage);
        formData.append('name', this.brandForm.get('name').value);
        formData.append('contact', this.brandForm.get('contact').value);
        formData.append('address', this.brandForm.get('address').value);
      } else {
        formData.append('name', this.brandForm.get('name').value);
        formData.append('contact', this.brandForm.get('contact').value);
        formData.append('address', this.brandForm.get('address').value);
      }
      this.updateBrand(formData);
    } else {
      if (this.brandImage) {
        formData.append('logo', this.brandImage);
        formData.append('name', this.brandForm.get('name').value);
        formData.append('contact', this.brandForm.get('contact').value);
        formData.append('address', this.brandForm.get('address').value);
      } else {
        formData.append('name', this.brandForm.get('name').value);
        formData.append('contact', this.brandForm.get('contact').value);
        formData.append('address', this.brandForm.get('address').value);
      }
      this.addBrand(formData);
    }
  }
  addBrand(brand) {
    this.productService.addBrand(brand).subscribe((res: ResponseModel) => {
      this.toastr.success('Brand Added!', 'Success!');
      this.allBrand.push(res.data);
      jQuery('#modal3').modal('hide');
      this.resetForm();
      this.rerenderDatatable();
    })
  }

  updateBrand(brand) {
    const id = this.allBrand[this.currentIndex]._id;
    this.productService.updateBrand(brand, id).subscribe((res: ResponseModel) => {
      jQuery('#modal3').modal('hide');
      this.toastr.info('Brand Updated Successfully!', 'Updated!!');
      this.resetForm();
      this.allBrand.splice(this.currentIndex, 1, res.data);
      this.currentBrandId = null;
      this.editing = false;
      this.rerenderDatatable();
    });
  }

  getAllBrand() {
    this.allBrand.length = 0;
    this.productService.getAllBrand().subscribe((res: ResponseModel) => {
      this.allBrand = res.data;
      this.dtTrigger.next();
    });
  }

  // viewBrand(i) {
  //   this.viewArray = this.allBrand[i];
  //   if (this.viewArray.logo) {
  //     this.showImage = true;
  //     this.image = this.imageUrl + this.viewArray.logo
  //     console.log(this.image)
  //   }
  //   else {
  //     this.showImage = false
  //   }
  // }

  editBrand(i) {
    this.editing = true;
    this.currentBrand = this.allBrand[i];
    this.currentBrandId = this.allBrand[i]._id;
    this.currentIndex = i;
    this.setFormValue();
  }

  deleteBrand(i) {
    if (confirm('You Sure you want to delete this Brand')) {
      this.productService.deleteBrand(this.allBrand[i]._id).toPromise().then(() => {
        this.toastr.warning('Brand Deleted!', 'Deleted!');
        this.allBrand.splice(i, 1);
        this.rerenderDatatable();
      }).catch((err) => console.log(err));
    }
  }

  setFormValue() {
    const brand = this.allBrand[this.currentIndex];
    this.brandForm.controls['name'].setValue(brand.name);
    this.brandForm.controls['address'].setValue(brand.address);
    this.brandForm.controls['contact'].setValue(brand.contact);
  }

  onBrandImageSelect(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      this.brandImage = event.target.files[0];
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.filenameBrandImage = event.target.result;
      }
      // }
    }
  }

  resetForm() {
    this.editing = false;
    this.submitted = false;
    this.editShowImage = false;
    this.filenameBrandImage = null;
    this.brandImage = null;
    this.brandForm.reset();
  }
}
