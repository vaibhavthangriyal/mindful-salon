import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { AdminModule } from './admin/admin.module';
import { AuthHeaderInterceptor } from './interceptors/header.interceptor';
import { CatchErrorInterceptor } from './interceptors/http-error.interceptor';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { MaintainanceComponent } from './extra/maintainance/maintainance.component';
import { LoginGaurd } from './auth/login/shared/login-gaurd.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LoginAuthGraud } from './auth/loginpage.gaurd.service';
import { DataTablesModule } from 'angular-datatables';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { UserModule } from './core/user/user.module';
import { CoreComponent } from './core/core.component';
import { ProductsModule } from './core/products/products.module';
import { OrderModuleModule } from './core/order-module/order-module.module';
import { CustomersModule } from './core/customers/customers.module';
import { TruckModule } from './core/truck/truck.module';
import { LocationManagerModule } from './core/location-manager/location-manager.module';
import { SupportModule } from './core/Support/support.module';
import { RouteModule } from './core/route/route.module';
import { SubscriptionModule } from './core/customersubscription/subscription.module';
import { EventModule } from './core/event/event.module';
import { EventSesrvice } from './event.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { VendorComponent } from './core/vendor/vendor.component';
import { VendorRoutingModule } from './core/vendor/shared/vendor.routing';
import { SettingsComponent } from './core/settings/settings.component';
import { NgxGalleryModule } from 'ngx-gallery';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    MaintainanceComponent,
    CoreComponent,
    VendorComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DataTablesModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AdminModule,
    AuthModule,
    AppRoutingModule,
    SharedModule,
    CustomersModule,
    OrderModuleModule,
    ProductsModule,
    TruckModule,
    UserModule,
    InputSwitchModule,
    ToastrModule.forRoot(),
    LocationManagerModule,
    SupportModule,
    RouteModule,
    SubscriptionModule,
    EventModule,
    FullCalendarModule,

    NgxGalleryModule,

    VendorRoutingModule
  ],
  providers: [
    LoginAuthGraud,
    LoginGaurd,
    ToastrService,
    EventSesrvice,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true,
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: CatchErrorInterceptor,
      multi: true,
    }],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
