import { Component, OnInit } from '@angular/core';
import { ProfileService } from './shared/profile.service';
import { ResponseModel } from '../../../shared/shared.model';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileForm: FormGroup;
  constructor(private profileService: ProfileService, private toasterService: ToastrService, private formBuilder: FormBuilder,
    private titleService: Title) {
    this.getInformation();
    this.titleService.setTitle('Mindful Salon | Profile');
  }

  ngOnInit() {
    this.initProfileForm();
  }

  initProfileForm() {
    this.profileForm = this.formBuilder.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      is_active: [true],
      password: ['', Validators.required],
      role: ['', Validators.required],
      mobile_number: ['', Validators.required],
      landmark: ['', Validators.required],
      street_address: ['', Validators.required],
      city: ['', Validators.required],
      profile_picture: [''],
      dob: [new Date(), Validators.required],
      gender: ['male']
    });
  }

  getInformation() {
    this.profileService.getOwnInformation().subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toasterService.error('Error Whil Updating', 'Try again');
      } else {
        this.setFormValue(res.data);
      }
    });
  }

  setFormValue(user) {
    this.profileForm.controls['email'].setValue(user.email);
    this.profileForm.controls['full_name'].setValue(user.full_name);
    this.profileForm.controls['role'].setValue(user.role._id);
    this.profileForm.controls['mobile_number'].setValue(user.mobile_number);
    if (user.dob) {
      const dob = user.dob.substring(0, 10);
      this.profileForm.controls['dob'].setValue(dob);
    } else {
      this.profileForm.controls['dob'].setValue(new Date());
    }
    this.profileForm.controls['gender'].setValue(user.gender);
    this.profileForm.controls['landmark'].setValue(user.landmark);
    this.profileForm.controls['password'].setValue(user.password);
    this.profileForm.controls['street_address'].setValue(user.street_address);
    this.profileForm.controls['city'].setValue(user.city);
    this.profileForm.controls['profile_picture'].setValue(user.profile_picture);
  }

  onSubmit() {
    this.profileService.updateOwnInformation(this.profileForm.value).subscribe((res: ResponseModel) => {
      if (res.errors) {
        this.toasterService.error('Error Whil Updating', 'Try again');
      } else {
        this.toasterService.success('Updated', 'Success');
        this.setFormValue(res.data);
      }
    });
  }
}
