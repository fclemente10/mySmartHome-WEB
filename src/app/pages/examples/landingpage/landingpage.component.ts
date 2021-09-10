
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';



@Component({
  selector: 'app-landingpage',
  templateUrl: 'landingpage.component.html'
})
export class LandingpageComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  usersNum = 0;
  equiposNum = 0;
  infoUsuario: any [] = [];
  infoEquipos: any [] = [];
  lineChartData: ChartDataSets[] = [
    { data: [12, 14, 13, 15, 25, 25, 24], label: 'Media Usuarios Activos diario' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Media Peticiones Realizadas diarias' }
  ];
  // Labels shown on the x-axis
  lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  // Define chart options
  lineChartOptions: ChartOptions = {
    responsive: true
  };

  // Define colors of chart segments
  lineChartColors: Color[] = [

    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
    }
  ];

  // Set true to show legends
  lineChartLegend = true;

  // Define type of chart
  lineChartType = 'line';

  lineChartPlugins = [];

  constructor(public auth: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder) {
    this.auth.getUsu().subscribe((data: any) => {
      this.infoUsuario = data;
      this.usersNum = this.infoUsuario.length;
    });
    this.auth.getDevices().subscribe((data: any) => {
      this.infoEquipos = data;
      this.equiposNum = this.infoEquipos.length;
    })
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('landing-page');


  }
  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('landing-page');
  }
  chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
}
