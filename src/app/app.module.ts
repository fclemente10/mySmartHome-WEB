import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule } from 'ngx-bootstrap/modal';

import { PagesModule } from './pages/pages.module';

import { IndexComponent } from './pages/index/index.component';
import { ProfilepageComponent } from './pages/examples/profilepage/profilepage.component';
import { RegisterpageComponent } from './pages/examples/registerpage/registerpage.component';
import { LandingpageComponent } from './pages/examples/landingpage/landingpage.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import {AuthenticationService} from './services/authentication.service';
import {BrowserModule} from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import {config} from 'rxjs';
import { FooterComponent } from './shared/footer/footer.component';
import {ChartsModule} from 'ng2-charts';

import { ClientComponent } from './pages/client/client.component';
import { EquiposComponent } from './pages/equipos/equipos.component';
import { InfouserComponent } from './pages/infouser/infouser.component';
import { EquipoComponent } from './pages/equipo/equipo.component';
import { ViviendaComponent } from './pages/vivienda/vivienda.component';
import { HabitacionComponent } from './pages/habitacion/habitacion.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    ClientComponent,
    EquiposComponent,
    InfouserComponent,
    EquipoComponent,
    ViviendaComponent,
    HabitacionComponent
    // IndexComponent,
    // ProfilepageComponent,
    // RegisterpageComponent,
    // LandingpageComponent
  ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        AppRoutingModule,
        ChartsModule,

        // BsDropdownModule.forRoot(),// ProgressbarModule.forRoot(),// TooltipModule.forRoot(),// CollapseModule.forRoot(),
        // TabsModule.forRoot(),
        PagesModule,
        CollapseModule,
        ReactiveFormsModule,
        TabsModule,
        // PaginationModule.forRoot(),// AlertModule.forRoot(),// BsDatepickerModule.forRoot(),// CarouselModule.forRoot(),
        // ModalModule.forRoot()
    ],
  providers: [NavbarComponent,
              AuthenticationService,
             {provide: LOCALE_ID, useValue: 'es-*'}],
  bootstrap: [AppComponent]
})
export class AppModule {}
