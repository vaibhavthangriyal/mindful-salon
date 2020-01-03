import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TokenStorage } from '../../../auth/token.storage';

@Injectable({
    providedIn: 'root'
})
export class VendorService {
    headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': this.tokenService.getToken()
    });
    vendorURL = 'api/user/';
    constructor(private tokenService: TokenStorage, private http: HttpClient) { }

    // GET APIs
    getAllVendors() {
        return this.http.get(this.vendorURL, { headers: this.headers });
    }

    // POST APIs
    addVendor(vendor) {
        return this.http.post(this.vendorURL, vendor, { headers: this.headers });
    }

    // PUT APIs
    updateVendor(vendor, vendorId) {
        return this.http.put(this.vendorURL + 'id/' + vendorId, vendor, { headers: this.headers });
    }

    // DELETE APIs
    deleteVendor(vendorId) {
        return this.http.post(this.vendorURL + vendorId, { headers: this.headers });
    }
}
