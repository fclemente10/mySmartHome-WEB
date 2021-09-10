import {ChangeDetectorRef, Component, NgZone, Directive, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Arduino, AuthenticationService, InfoEquipo, Onoff, UserDetails, ip} from '../../services/authentication.service';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {takeUntil} from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.scss']
})

export class EquipoComponent implements OnInit, OnDestroy {
  myWebSocket: WebSocketSubject<any> = webSocket({url:'ws://2.139.215.161:3300', deserializer: e => e.data}); //'ws:192.168.56.1:3300', deserializer: e => e.data}); //
    // 'ws://2.139.215.161:3300', deserializer: e => e.data});

  lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Product B' }
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

  protected subscription: Subscription;
  arduino: Arduino = {
    id: '0',
    serialNumber: '',
    onoff: '',
    accion: '',
    horaInicio: '',
    horaFinal: '',
  };
  onoff: Onoff = {
    serialNumber: '',
    onoff: '',
  };
  infoEquipo: InfoEquipo = {
    id: 0,
    serialNumber: '',
    nombreEquipo: '',
    descripcion: '',
    emailCliente: '',
    lastConn: '',
  };
  infoArray = [];
  arduinoArray = [];
  decomposicion: any[] = [];
  formulario: FormGroup;
  serial = '';
  submit: boolean;
  dataWS: any;
  destroyed$ = new Subject();
  public showBlock = true;

  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute,
              ) {
    this.subscription = this.route.params.subscribe(param => {
      this.serial = param.serial;
    });
      this.subscription = this.auth.getEquipo(this.serial).subscribe((data: any) => {
        this.infoArray = data;
        this.decomposicion = this.infoArray.map(item => {
          this.infoEquipo.id = item.id;
          this.infoEquipo.serialNumber = item.serialNumber;
          this.infoEquipo.nombreEquipo = item.nombreEquipo;
          this.infoEquipo.descripcion = item.descripcion;
          this.infoEquipo.emailCliente = item.emailCliente;
          this.infoEquipo.lastConn = item.lastConn;
        });
      });

    this.formulario = new FormGroup({
      arduinoData: new FormGroup({
        id: new FormControl(null),
        serialNumber: new FormControl(null, [Validators.required]),
        onoff: new FormControl(null),
        accion: new FormControl(null, [Validators.required]),
        horaInicio: new FormControl(null),
        horaFinal: new FormControl(null),
      })
    });
  }
  @ViewChild('f', {static: false}) FormGroup: NgForm;

  ngOnInit(): void {
    console.log('Pagina Edit?=>' + this.serial );
    this.subscription = this.auth.getArduino(this.serial).subscribe((data: any) => {
      this.arduinoArray = data;
      console.log(data);
      this.decomposicion = this.arduinoArray.map(item => {
        this.arduino.id = item.id;
        this.arduino.serialNumber = item.serialNumber;
        this.arduino.onoff = item.serialNumber;
        this.arduino.accion = item.accion;
        this.arduino.horaInicio = item.horaInicio;
        this.arduino.horaFinal = item.horaFinal;
      });
    });

    this.myWebSocket.asObservable().pipe(takeUntil(this.destroyed$)
    ).subscribe(data =>{
      const Jvalor = JSON.parse(data)
      console.log(JSON.parse(data));
      console.log('up response');
      if(Jvalor.serial === this.serial ) this.reload();
    });

    if (!this.auth.isLoggedIn()) {
      Swal.fire('Para registrar usuarios es necesario una sección!');
      this.router.navigateByUrl('/home');
    }
  }
  btnBorrar(serial: string) {
    console.log('BTN_Borrar');
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Al borrar no podrás recuperar el equipo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si si, lo borre!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.auth.delArduino(serial).subscribe(() => {
          Swal.fire('Equipo borrado con éxito!');
        }, err => {
          console.error(err);
          Swal.fire(err.errorMessage);
        });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'el equipo está seguro',
            'error'
        )
      }
    })
    this.reload();
  }

  btnEditar(serial: string){
    this.submit = true;
    this.subscription = this.auth.getArduino(serial).subscribe((data: any) => {
      this.arduinoArray = data;
      console.log('info arduino =>');
      console.log(this.arduinoArray);
      this.decomposicion = this.arduinoArray.map(item => {
        this.arduino.id = item.id;
        this.arduino.serialNumber = item.serialNumber;
        this.arduino.onoff = item.onoff;
        this.arduino.accion = item.accion;
        this.arduino.horaInicio = item.horaInicio;
        this.arduino.horaFinal = item.horaFinal;
      });
      console.log('this.formulario=> ');
      console.log(this.formulario);
    });

  }
  OnSubmitEdit(){

    this.arduino.id = this.formulario.value.arduinoData.id;
    this.arduino.serialNumber = this.formulario.value.arduinoData.serialNumber;
    this.arduino.accion = this.formulario.value.arduinoData.accion;
    this.arduino.horaFinal = this.formulario.value.arduinoData.horaFinal;
    this.arduino.horaInicio = this.formulario.value.arduinoData.horaInicio;
    const serial = this.arduino.serialNumber;
    this.auth.putArduino(this.arduino).subscribe((resp: any) =>{
      Swal.fire('Equipo editado con éxito!');
    }, err => {
      console.error(err);
      Swal.fire('Error',
                      '' + err.message,
                'error');
    });
    this.myWebSocket.next({serial});
 //   this.myWebSocket.next(JSON.stringify('{"serial":"' + serial +'"}'));
    this.reload();
  }

  onSubmitON(serial: string) {
    this.onoff.serialNumber = serial;
    this.onoff.onoff = '0';
    console.log("submitted on en onoff");

 //   this.subscription = this.auth.onoff(this.onoff).subscribe((data: any) => {
    this.auth.enchufadoQuitado(this.onoff).subscribe((data: any) => {
      Swal.fire('Equipo Quitado con éxito!');
      console.log("Equipo Quitado con éxito!");
    }, err => {
      console.log(err);
      console.log("Error Quitar!");
      Swal.fire('Error',
                      '' + err.message,
                'error');
    });
      this.submit = false;
      this.myWebSocket.next({serial}), err => console.log(err),
          () => console.log('complete')
   //   this.myWebSocket.next(JSON.stringify('{"serial":"' + serial +'"}'));

      this.reload();
  }

  onSubmitOFF(serial: string) {
    this.onoff.serialNumber = serial;
    this.onoff.onoff = '1';
    console.log("submitted off en onoff");

 //   this.subscription = this.auth.onoff(this.onoff).subscribe((data: any) => {
    this.auth.enchufadoQuitado(this.onoff).subscribe((data: any) => {
      console.log("Equipo Enchufado con éxito!");
      Swal.fire('Equipo enchufado con éxito!');
    }, err => {
      console.log(err);
      console.log("Error Quitar!"), err => console.log(err),
          () => console.log('complete');
      Swal.fire('Error',
                '' + err.message,
                'error');
    });

      this.submit = false;
      this.myWebSocket.next({serial}), err => console.log(err),
          () => console.log('complete');
  //    this.myWebSocket.next('{"serial":"' + serial +'"}');
      this.reload();
  }

  reload() {
    this.submit = false;
    console.error('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  public toggle() {
    this.showBlock = !this.showBlock;
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.subscription.unsubscribe();
  }
  chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
  chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

}
