import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TokenStorage } from '../../../../auth/token.storage';

@Injectable({
    providedIn: 'root'
})
export class CallLogService {
    headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': this.tokenService.getToken()
    });
    callLogURL = 'api/calllog/';
    constructor(private tokenService: TokenStorage, private http: HttpClient) { }

    // GET APIs
    getAllCallLogs() {
        return this.http.get(this.callLogURL, { headers: this.headers });
    }

    // POST APIs
    addCallLog(CallLog) {
        return this.http.post(this.callLogURL, CallLog, { headers: this.headers });
    }

    // PUT APIs
    updateCallLog(CallLog, CallLogId) {
        return this.http.put(this.callLogURL + 'id/' + CallLogId, CallLog, { headers: this.headers });
    }

    // DELETE APIs
    deleteCallLog(CallLogId) {
        return this.http.post(this.callLogURL + CallLogId, { headers: this.headers });
    }
}
