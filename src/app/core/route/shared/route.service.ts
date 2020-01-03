import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorage } from '../../../auth/token.storage';

@Injectable({
  providedIn: 'root'
})

export class RouteService {

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'token': this.tokenService.getToken()
  });

  constructor(private http: HttpClient, private tokenService: TokenStorage) { }

  url = '/api/route';
  url2 = '/api/customer/addresswithnoroute';
  url3 = '/api/route/customer'
  url4 = '/api/user/dboy';
  url5 = '/api/customer/byroute'

  // Rotes APIS

  getAllRoutes() {
    return this.http.get(this.url + '/', { headers: this.headers })
  }

  addRoute(route) {
    return this.http.post(this.url + '/', route, { headers: this.headers })
  }

  deleteRoute(id) {
    return this.http.delete(this.url + '/' + id, { headers: this.headers })
  }

  updateRoute(route, id) {
    return this.http.put(this.url + '/' + id, route, { headers: this.headers })
  }


  // Delivery Boy Users

  getAllDeliveryBoyUsers() {
    return this.http.get(this.url4 + '/', { headers: this.headers })
  }

  // Get Customer With No Routes

  getAllCustomersWithNoRoutes() {
    return this.http.get(this.url2 + '/', { headers: this.headers })
  }

  // AssignRoute To Customer
  updateCustomerRoute(route) {
    return this.http.put(this.url3 + '/', route, { headers: this.headers })
  }

  // Customer By Route

  getCustomerByRoute(id) {
    return this.http.get(this.url5 + '/' + id, { headers: this.headers })
  }

} 