import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../shared/userrole.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';
import { Subject } from 'rxjs';
import { ResponseModel } from '../../../shared/shared.model';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-userrole',
  templateUrl: './userrole.component.html',
  styleUrls: ['./userrole.component.scss']
})
export class UserroleComponent implements OnInit {
  jQuery: any;
  allUserRoles: any[] = [];
  currentUserRole: any;
  currentUserroleid: any;
  current_user_index: any;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  userRoleForm: FormGroup;
  editing: Boolean = false;
  submitted: Boolean = false;
  isAdmin: Boolean = false;
  constructor(
    private userRoleService: UserRoleService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private titleService: Title) {
    this.titleService.setTitle('User Role Management');

  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [10, 15, 25, -1],
        [10, 15, 25, 'All']
      ],
      destroy: true,
      retrive: true,
      dom: '<html5buttons"B>lTfgitp',
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      },
      // dom: 'Bfrtip',
      buttons: [
        // 'colvis',
        'copy',
        'print',
        'excel',
      ]
    };
    this.initForm();
    this.getUserRole();
  }

  get f() { return this.userRoleForm.controls; }

  submit() {
    console.log(this.userRoleForm.value);
    console.log(this.isAdmin);
    this.submitted = true;
    console.log(this.userRoleForm.invalid);
    if (this.editing) { delete this.userRoleForm.value.isAdmin; }
    if (this.userRoleForm.invalid) { return; }
    console.log(this.userRoleForm.invalid);
    if (this.editing) {
      this.updateUser(this.userRoleForm.value);
    } else {
      this.AddUserRole(this.userRoleForm.value);
    }
  }

  AddUserRole(userrole) {
    if (userrole.isAdmin === true) {
      // USERS
      userrole.privileges.GET_ALL_USERS = true,
        userrole.privileges.ADD_NEW_USER = true,
        userrole.privileges.DELETE_USER = true,
        userrole.privileges.UPDATE_USER = true,
        userrole.privileges.GET_USER_BY_ROLE = true,
        userrole.privileges.ADD_NEW_USER = true,
        userrole.privileges.DELETE_USER = true,
        userrole.privileges.UPDATE_USER = true,
        userrole.privileges.GET_ALL_PRODUCTS = true,
        userrole.privileges.GET_PRODUCT = true,
        userrole.privileges.ADD_NEW_PRODUCT = true,
        userrole.privileges.DELETE_PRODUCT = true,
        userrole.privileges.UPDATE_PRODUCT = true,
        userrole.privileges.GET_ALL_ORDERS = true,
        userrole.privileges.GET_ORDER = true,
        userrole.privileges.ADD_NEW_ORDER = true,
        userrole.privileges.DELETE_ORDER = true,
        userrole.privileges.GET_ALL_PRODUCT_CATEGORY = true,
        userrole.privileges.GET_PRODUCT_CATEGORY = true,
        userrole.privileges.ADD_NEW_PRODUCT_CATEGORY = true,
        userrole.privileges.UPDATE_PRODUCT_CATEGORY = true,
        userrole.privileges.DELETE_PRODUCT_CATEGORY = true,
        userrole.privileges.GET_ALL_BRANDS = true,
        userrole.privileges.DELETE_BRAND = true,
        userrole.privileges.UPDATE_BRAND = true,
        userrole.privileges.ADD_NEW_BRAND = true,
        userrole.privileges.GET_ALL_CUSTOMERS = true,
        userrole.privileges.UPDATE_CUSTOMER = true,
        userrole.privileges.ADD_NEW_CUSTOMER = true,
        userrole.privileges.DELETE_CUSTOMER = true
    }
    delete userrole.isAdmin;
    console.log(userrole);
    this.userRoleService.addUserRole(userrole).subscribe((res: ResponseModel) => {
      console.log(res.data);
      jQuery('#userRoleModal').modal('hide');
      this.allUserRoles.push(res.data);
      this.toastr.success('User role Added!', 'Added!');
    });
  }

  deleteUserRole(index) {
    if (confirm('You Sure You Want to Delete this User Role??')) {
      this.userRoleService.deleteUserRole(this.allUserRoles[index]._id).subscribe(() => {
        this.toastr.warning('User role Deleted!', 'Deleted!');
        this.allUserRoles.splice(index, 1);
      });
    }
  }

  editUserRole(i) {
    this.editing = true;
    this.currentUserRole = this.allUserRoles[i];
    this.currentUserroleid = this.allUserRoles[i]._id;
    this.current_user_index = i;
    this.setFormValue();
  }

  getUserRole() {
    this.allUserRoles.length = 0;
    this.userRoleService.getAllUserRoles().subscribe((res: ResponseModel) => {
      this.allUserRoles = res.data;
      console.log(res.data);
      this.dtTrigger.next();
    });
  }

  initForm() {
    this.userRoleForm = this.formBuilder.group({
      name: ['', Validators.required],
      isAdmin: [false],
      privileges: this.formBuilder.group({
        // USERS
        GET_ALL_USERS: [false],
        GET_USER_BY_ROLE: [false],
        ADD_NEW_USER: [false],
        DELETE_USER: [false],
        UPDATE_USER: [false],
        // PRODUCTS
        GET_ALL_PRODUCTS: [false],
        GET_PRODUCT: [false],
        ADD_NEW_PRODUCT: [false],
        DELETE_PRODUCT: [false],
        UPDATE_PRODUCT: [false],
        // ORDERS
        GET_ALL_ORDERS: [false],
        GET_ORDER: [false],
        ADD_NEW_ORDER: [false],
        DELETE_ORDER: [false],
        // PRODUCTS CATEGORY
        GET_ALL_PRODUCT_CATEGORY: [false],
        GET_PRODUCT_CATEGORY: [false],
        ADD_NEW_PRODUCT_CATEGORY: [false],
        UPDATE_PRODUCT_CATEGORY: [false],
        DELETE_PRODUCT_CATEGORY: [false],
        // BRAND
        GET_ALL_BRANDS: [false],
        DELETE_BRAND: [false],
        UPDATE_BRAND: [false],
        ADD_NEW_BRAND: [false],
        // CUSTOMER
        GET_ALL_CUSTOMERS: [false],
        UPDATE_CUSTOMER: [false],
        ADD_NEW_CUSTOMER: [false],
        DELETE_CUSTOMER: [false]
      })
    });
  }


  updateUser(user) {
    console.log(user);
    this.userRoleService.updateUserRole(this.allUserRoles[this.current_user_index]._id, user).subscribe((res: ResponseModel) => {
      console.log(res);
      jQuery('#userRoleModal').modal('hide');
      this.allUserRoles.splice(this.current_user_index, 1, res.data);
      this.toastr.info('User role Updated!', 'Updated!');
      this.resetForm();
    });
  }

  resetForm() {
    this.editing = false;
    this.submitted = false;
    this.userRoleForm.reset();
    this.initForm();
  }

  setFormValue() {
    const user = this.allUserRoles[this.current_user_index];
    this.userRoleForm.get('name').setValue(user.name);
    console.log(user);
    // USER
    this.userRoleForm.controls['privileges'].get('GET_ALL_USERS').setValue(user.privileges.GET_ALL_USERS);
    this.userRoleForm.controls['privileges'].get('GET_USER_BY_ROLE').setValue(user.privileges.GET_USER_BY_ROLE);
    this.userRoleForm.controls['privileges'].get('ADD_NEW_USER').setValue(user.privileges.ADD_NEW_USER);
    this.userRoleForm.controls['privileges'].get('DELETE_USER').setValue(user.privileges.DELETE_USER);
    this.userRoleForm.controls['privileges'].get('UPDATE_USER').setValue(user.privileges.UPDATE_USER);
    // PRODUCTS
    this.userRoleForm.controls['privileges'].get('GET_ALL_PRODUCTS').setValue(user.privileges.GET_ALL_PRODUCTS);
    this.userRoleForm.controls['privileges'].get('GET_PRODUCT').setValue(user.privileges.GET_PRODUCT);
    this.userRoleForm.controls['privileges'].get('ADD_NEW_PRODUCT').setValue(user.privileges.ADD_NEW_PRODUCT);
    this.userRoleForm.controls['privileges'].get('DELETE_PRODUCT').setValue(user.privileges.DELETE_PRODUCT);
    this.userRoleForm.controls['privileges'].get('UPDATE_PRODUCT').setValue(user.privileges.UPDATE_PRODUCT);
    // ORDERS
    this.userRoleForm.controls['privileges'].get('GET_ALL_ORDERS').setValue(user.privileges.GET_ALL_ORDERS);
    this.userRoleForm.controls['privileges'].get('GET_ORDER').setValue(user.privileges.GET_ORDER);
    this.userRoleForm.controls['privileges'].get('ADD_NEW_ORDER').setValue(user.privileges.ADD_NEW_ORDER);
    this.userRoleForm.controls['privileges'].get('DELETE_ORDER').setValue(user.privileges.DELETE_ORDER);
    // CUSTOMERS
    this.userRoleForm.controls['privileges'].get('GET_ALL_CUSTOMERS').setValue(user.privileges.GET_ALL_CUSTOMERS);
    this.userRoleForm.controls['privileges'].get('UPDATE_CUSTOMER').setValue(user.privileges.UPDATE_CUSTOMER);
    this.userRoleForm.controls['privileges'].get('ADD_NEW_CUSTOMER').setValue(user.privileges.ADD_NEW_CUSTOMER);
    this.userRoleForm.controls['privileges'].get('DELETE_CUSTOMER').setValue(user.privileges.DELETE_CUSTOMER);
    // BRANDS
    this.userRoleForm.controls['privileges'].get('GET_ALL_BRANDS').setValue(user.privileges.GET_ALL_BRANDS);
    this.userRoleForm.controls['privileges'].get('DELETE_BRAND').setValue(user.privileges.DELETE_BRAND);
    this.userRoleForm.controls['privileges'].get('ADD_NEW_BRAND').setValue(user.privileges.ADD_NEW_BRAND);
    this.userRoleForm.controls['privileges'].get('UPDATE_BRAND').setValue(user.privileges.UPDATE_BRAND);
    // CATEGORY
    this.userRoleForm.controls['privileges'].get('GET_ALL_PRODUCT_CATEGORY').setValue(user.privileges.GET_ALL_PRODUCT_CATEGORY);
    this.userRoleForm.controls['privileges'].get('GET_PRODUCT_CATEGORY').setValue(user.privileges.GET_PRODUCT_CATEGORY);
    this.userRoleForm.controls['privileges'].get('ADD_NEW_PRODUCT_CATEGORY').setValue(user.privileges.ADD_NEW_PRODUCT_CATEGORY);
    this.userRoleForm.controls['privileges'].get('UPDATE_PRODUCT_CATEGORY').setValue(user.privileges.UPDATE_PRODUCT_CATEGORY);
    this.userRoleForm.controls['privileges'].get('DELETE_PRODUCT_CATEGORY').setValue(user.privileges.DELETE_PRODUCT_CATEGORY);
  }

}
