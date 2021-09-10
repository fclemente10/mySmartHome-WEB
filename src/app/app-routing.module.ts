import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent } from './pages/index/index.component';
import { ProfilepageComponent } from './pages/examples/profilepage/profilepage.component';
import { RegisterpageComponent } from './pages/examples/registerpage/registerpage.component';
import { LandingpageComponent } from './pages/examples/landingpage/landingpage.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ClientComponent} from './pages/client/client.component';
import {EquiposComponent} from './pages/equipos/equipos.component';
import {InfouserComponent} from './pages/infouser/infouser.component';
import {EquipoComponent} from './pages/equipo/equipo.component';
import {ViviendaComponent} from './pages/vivienda/vivienda.component';
import {HabitacionComponent} from './pages/habitacion/habitacion.component';
import {AlarmComponent} from './pages/alarm/alarm.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: IndexComponent },
  { path: 'profile', component: ProfilepageComponent },
  { path: 'register', component: RegisterpageComponent },
  { path: 'landing', component: LandingpageComponent },
  { path: 'cliente', component: ClientComponent },
  { path: 'equipos', component: EquiposComponent },
  { path: 'alarm/:serial', component: AlarmComponent },
  { path: 'equipos/:serial', component: EquiposComponent },
  { path: 'equipo/:serial', component: EquipoComponent },
 // { path: 'infoequipo/:serial', component: InfoequipoComponent, pathMatch: 'full' },
  { path: 'infouser', component: InfouserComponent},
  { path: 'vivienda', component: ViviendaComponent },
  { path: 'vivienda/:emailCliente', component: ViviendaComponent },
  { path: 'habitacion/:nombreVivienda', component: HabitacionComponent },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: []
})
export class AppRoutingModule {}
