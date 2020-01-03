import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ValidationErrors, FormBuilder } from '@angular/forms';


import { AuthService } from '../auth.service';
import { VendorService } from '../../core/vendor/shared/vendor.service';
import { ToastrService } from 'ngx-toastr';
import { ResponseModel } from '../../shared/shared.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { TokenStorage } from '../token.storage';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  submitted: Boolean = false;
  vendorForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder, private vendorService: VendorService, private toasterService: ToastrService,
    private router: Router, private http: HttpClient, private tokenService: TokenStorage
  ) {
    this.initVendorForm();
  }

  ngOnInit() {
  }

  get f() { return this.vendorForm.controls; }

  initVendorForm() {
    this.vendorForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      mobile_number: ['', [Validators.required]],
      password: ['', [Validators.required]],
      full_name: ['', Validators.required],
      city: ['', Validators.required]
    });
  }
  onSubmit() {
    this.submitted = true;
    console.log(this.vendorForm.value);
    if (this.vendorForm.invalid) {
      this.toasterService.error('Form Is Invalid', 'Fill All Fields');
      return;
    } else {
      this.registerVendor(this.vendorForm.value).subscribe((res: ResponseModel) => {
        console.log(res);
        if (res.errors) {
          if (res.message = 'Email already registered') {
            this.toasterService.error('Email Already Registred', 'Try Again');
          } else {
            this.toasterService.error('Error While Adding Vendor', 'Try Again');
          }
        } else {
          this.toasterService.success('Vendor Added Successfully', 'Success');
          this.resetVendorForm();
          this.router.navigateByUrl('/login');
        }
      });
    }
  }

  resetVendorForm() {
    this.vendorForm.reset();
    this.initVendorForm();
    this.submitted = false;
  }

  registerVendor(vendor) {
    return this.http.post('/api/auth/vendorregister', vendor);
  }

}
