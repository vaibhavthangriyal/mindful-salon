import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VendorService } from './shared/vendor.service';
import { ResponseModel } from '../../shared/shared.model';
import { ToastrService } from 'ngx-toastr';
import { VendorModel } from './shared/vendor.model';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserService } from '../user/shared/user-service.service';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit {

  allVendors: VendorModel[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  editing: Boolean = false;
  jQuery: any;
  selectedVendor: VendorModel;
  selectedVendorIndex: number;
  submitted: Boolean = false;
  uploading: Boolean = false;
  vendorForm: FormGroup;
  constructor(
    private formbuilder: FormBuilder,
    private vendorService: VendorService,
    private toasterService: ToastrService,
    private titleService: Title,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Salon | Vendor Management');
    this.initDatatable();
    this.getAllVendors();
    this.initVendorForm();
  }

  // INIT FUNCTIONS
  initDatatable() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [10, 15, 25, -1],
        [10, 15, 25, 'All']
      ],
      destroy: true,
      retrive: true,
      // dom: '<'html5buttons'B>lTfgitp',
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      },
      // initComplete: function (settings, json) {
      //   $('.button').removeClass('dt-button');
      // },
      // dom: "l <'bottom'B> f r t i p",
      dom: "l f r t i p",
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

  initVendorForm() {
    this.vendorForm = this.formbuilder.group({
      email: ['', [Validators.required]],
      mobile_number: ['', [Validators.required]],
      profile_picture: [''],
      is_active: [false],
      city: [''],
      landmark: [''],
      street_address: [''],
      H_no_society: [''],
      password: ['', [Validators.required]],
      full_name: ['', Validators.required],
      description: ['', [Validators.required]],
      role: ['5df79106ea91ab0017c6c763']
    });
  }

  // SUBMIT FUNCTIONS

  onSubmit() {
    console.log(this.vendorForm.value);
    this.submitted = true;
    if (this.vendorForm.invalid) {
      this.toasterService.error('Form Is Invalid', 'Fill All Fields');
      return;
    }
    console.log(this.vendorForm.value);
    if (this.editing) {
      this.vendorForm.removeControl('email');
      this.updateVendor(this.vendorForm.value);
    } else {
      this.addVendor(this.vendorForm.value);
    }
  }

  // GET FUNCTIONS
  get f() { return this.vendorForm.controls; }

  getAllVendors() {
    this.userService.getAllVendors().subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toasterService.error('Error While Fetching Data', 'Try Again');
      } else {
        this.allVendors.length = 0;
        this.allVendors = res.data;
        console.log(this.allVendors);
        this.dtTrigger.next();
      }
    });
  }

  // POST FUNCTIONS
  addVendor(vendor) {
    this.userService.addUser(vendor).subscribe((res: ResponseModel) => {
      if (res.errors) {
        switch (res.errors) {
          case ('Email already registered'):
            this.toasterService.error('Email Already Registred', 'Try Again');
            break;
        }
        this.toasterService.error('Error While Adding Vendor', 'Try Again');
      } else {
        this.allVendors.push(res.data);
        this.toasterService.success('Vendor Added Successfully', 'Success');
        jQuery('#formModal').modal('hide');
        this.resetVendorForm();
      }
    });
  }

  uploadCSV(file) {
    console.log(file);
  }

  // UPDATE FUNCTIONS
  updateVendor(vendor) {
    this.userService.updateUser(vendor, this.selectedVendor._id).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toasterService.error('Error While Adding Vendor', 'Try Again');
      } else {
        this.allVendors.splice(this.selectedVendorIndex, res.data);
        this.toasterService.info('Vendor Updated Successfully', 'Updated');
        jQuery('#formModal').modal('hide');
        this.resetVendorForm();
      }
    });
  }

  // DELETE FUNCTIONS
  deleteVendor(i) {
    console.log(this.allVendors[i]);
    this.userService.deleteUser(this.allVendors[i]._id).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toasterService.error('Error While Adding Vendor', 'Try Again');
      } else {
        this.allVendors.length = 0;
        this.allVendors = res.data;
      }
    });
  }

  editVendor(i) {
    this.editing = true;
    this.selectedVendor = this.allVendors[i];
    this.selectedVendorIndex = i;
    this.setFormValue(this.selectedVendor);
  }

  setFormValue(selectedVendor: VendorModel) {
    this.vendorForm.get('email').disable();
    console.log(selectedVendor);
    this.vendorForm.get('landmark').setValue(selectedVendor.landmark);
    this.vendorForm.get('city').setValue(selectedVendor.city);
    this.vendorForm.get('description').setValue(selectedVendor.description);
    this.vendorForm.get('email').setValue(selectedVendor.email);
    this.vendorForm.get('full_name').setValue(selectedVendor.full_name);
    this.vendorForm.get('is_active').setValue(selectedVendor.is_active);
    this.vendorForm.get('mobile_number').setValue(selectedVendor.mobile_number);
    this.vendorForm.get('profile_picture').setValue(selectedVendor.profile_picture);
    this.vendorForm.get('H_no_society').setValue(selectedVendor.H_no_society);
    this.vendorForm.get('street_address').setValue(selectedVendor.street_address);
    this.vendorForm.get('password').setValue(selectedVendor.password);
  }

  selectFile(event) {
    console.log(event);
  }

  resetVendorForm() {
    this.vendorForm.reset();
    this.initVendorForm();
    this.editing = false;
    this.submitted = false;
    this.vendorForm.get('email').enable();
  }

}
