import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomersService } from '../shared/customers.service';
import { ResponseModel } from '../../../shared/shared.model';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as  moment from 'moment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  allCustomersOrders: any[] = [];
  quantityForm: FormGroup;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  orderStatus: any;
  selectedOrder: any;
  selectedOrderIndex: number;
  constructor(private customersService: CustomersService, private formBuilder: FormBuilder, private toasterService: ToastrService,
    private titleService: Title) {
    this.titleService.setTitle('Order Management');
    this.getAllOrders();
  }

  ngOnInit() {
    this.initQuantityForm();
    this.initDataTable();
  }

  getAllOrders() {
    this.customersService.getAllCustomersOrders().subscribe((res: ResponseModel) => {
      if (res.errors) {

      } else {
        console.log(res.data);
        this.allCustomersOrders = res.data;
        this.dtTrigger.next();
      }
    });
  }

  viewCustomerOrder(i) {
    while (this.quantityFormGetter.length > 0) {
      this.quantityFormGetter.removeAt(0);
    }
    this.selectedOrder = this.allCustomersOrders[i];
    this.selectedOrderIndex = i;
    for (let index = 0; index < this.selectedOrder.products.length; index++) {
      if (this.selectedOrder.products) {
        this.quantityFormGetter.push(this.initItemRows());
        this.quantityFormGetter.controls[index].get('accepted').setValue(this.selectedOrder.products[index].quantity);
        this.quantityFormGetter.controls[index].get('product').setValue(this.selectedOrder.products[index].product._id);
      }
    }
    console.log(this.quantityFormGetter.value);
  }

  initQuantityForm() {
    this.quantityForm = this.formBuilder.group({
      products: this.formBuilder.array([])
    });
  }

  get quantityFormGetter() {
    return this.quantityForm.get('products') as FormArray;
  }

  addNewRow() {
    this.quantityFormGetter.push(this.initItemRows());
  }

  deleteRow(index: number) {
    this.quantityFormGetter.removeAt(index);
  }

  initItemRows() {
    return this.formBuilder.group({
      product: [''],
      accepted: ['']
    });
  }

  initDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [10, 15, 25, -1],
        [10, 15, 25, 'All']
      ],
      destroy: true,
      retrive: true,
      // dom: '<"html5buttons"B>lTfgitp',
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      }, initComplete: function (settings, json) {
        $('.button').removeClass('dt-button');
      },
      dom: "l <'bottom'B> f r t i p",
      // dom:"B<'#colvis row'><'row'><'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-4'i>><'row'p>",
      buttons: [
        {
          text: 'Excel',
          extend: 'excel',
          className: 'table-button btn btn-sm button btn-danger '
        },
        {
          extend: 'print',
          text: 'Print',
          className: 'table-button btn-sm button btn btn-danger '
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'table-button btn-sm button btn btn-danger '
        }
      ]
    };
  }

  acceptOrder() {
    let orderStatus;
    const selectedProducts = this.allCustomersOrders[this.selectedOrderIndex].products;
    const product = this.quantityForm.value;
    const product2 = product.products;
    console.log(product);
    for (let index = 0; index < selectedProducts.length; index++) {
      if (selectedProducts[index].quantity === product.products[index].accepted) {
        orderStatus = 'Fullfill';
      } else if (selectedProducts[index].quantity !== product.products[index].accepted) {
        orderStatus = 'Partailly Fullfilled';
      }
    }
    const body = {
      products: product2,
      orderStatus: orderStatus
    };
    this.customersService.acceptCustomerOrder(this.selectedOrder._id, body, orderStatus)
      .subscribe((res: ResponseModel) => {
        if (res.errors) {
          console.log('Error');
          this.toasterService.error('Order Not Accepted', 'Error');
          jQuery('#exampleModal').modal('hide');
        } else {
          this.allCustomersOrders.splice(this.selectedOrderIndex, 1, res.data);
          this.toasterService.success('Order Accepted', 'Accepted');
          jQuery('#exampleModal').modal('hide');
          console.log('Accepted');
        }
      });
  }

  cancleOrder() {
    const product = { products: this.quantityForm.value };
    console.log(product);
    this.customersService.cancelCustomerOrder(this.selectedOrder._id)
      .subscribe((res: ResponseModel) => {
        if (res.errors) {
          console.log('Error');
          this.toasterService.error('Order Not Cancelled', 'Error');
        } else {
          // this.allCustomersOrders.splice(this.selectedOrderIndex, 1, res.data);
          if (confirm('You Sure you want to cancel this order')) {
            this.toasterService.success('Order Cancelled', 'Cancelled');
            jQuery('#exampleModal').modal('hide');
            console.log('Cancelled');
          }
        }
      });
    console.log(this.quantityForm.value);
  }

  calculateTotalAmount() {
    let total = 0;
    for (let index = 0; index < this.selectedOrder.products.length; index++) {
      total = total + (this.quantityFormGetter.controls[index].get('accepted').value * this.selectedOrder.products[index].product.price);
      console.log(total);
    }
    return total;
  }
}
