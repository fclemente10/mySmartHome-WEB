import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, LOCALE_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthenticationService, InfoEquipo, Onoff, ip} from '../../services/authentication.service';
import {DatePipe} from '@angular/common';
import { formatDate } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
/*const subject = webSocket({url: 'ws://192.168.0.61:3300', deserializer: e => e.data});

subject.subscribe(
  msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
  err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
  () => console.log('complete') // Called when connection is closed (for whatever reason).
);
*/
registerLocaleData(es);
@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.component.html',
  styles: []
})
export class EquiposComponent implements OnInit, OnDestroy {
  date: Date;
  pipe = new DatePipe('es');
  myWebSocket: WebSocketSubject<any> = webSocket({url: 'ws://' + ip + ':3300', deserializer: e => e.data});

  equipoArray = [];
  decomposicion: any[] = [];
  formulario: FormGroup;
  status = false;
  today = new Date();

  infoEquipo: InfoEquipo = {
    id: 0,
    serialNumber: '',
    nombreEquipo: '',
    descripcion: '',
    emailCliente: '',
    lastConn: '',
  };

  onoff: Onoff = {
    serialNumber: '',
    onoff: '',
  };

  error = false;
  messageError = '';
  submit: boolean;
  serial= '';

  message: any;
  dataWS: any;
  destroyed$ = new Subject();
  private zone: NgZone;
  protected subscription: Subscription;

  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute) {

    this.error = false;
    this.messageError = ' ';

    /******************** Buscando EQUIPOS ************************/
    this.auth.getDevices().subscribe((data: any) => {
      console.log('EQUIPOS=> ');
      console.log(data);
      this.equipoArray = data;
    }, (errorServicio) => {
      console.log(errorServicio);
      this.error = true;
      this.messageError = 'No ha sido posible obtener los equipos';
    });

    this.formulario = new FormGroup({
      equipoData: new FormGroup({
        id: new FormControl(''),
        serialNumber: new FormControl(null, [Validators.required]),
        nombreEquipo: new FormControl(null, [Validators.required]),
        descripcion: new FormControl(null, [Validators.required]),
        emailCliente: new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        lastConn: new FormControl('0'),
      })
    });

    this.subscription = this.route.params.subscribe(param => {
      this.serial = param.serial;
      if (this.serial !== undefined){
        this.btnEditar(this.serial)
      }
    });
  } // FIN CONSTRUCTOR

  ngOnInit(): void {
    this.messageError = 'all done loading :)';
    this.cdr.detectChanges();
    this.submit = false;

    this.myWebSocket.asObservable().pipe(takeUntil(this.destroyed$)
    ).subscribe((data: any) => {
      this.dataWS = data;
      console.log('info data =>');
      console.log(this.dataWS);
      this.reload();
    });

    if (!this.auth.isLoggedIn()) {
      Swal.fire('Para ver equipos es necesario una sección!');
      this.router.navigateByUrl('/home');
    }
  }

  getEquipo(serial: string){
    //  localStorage.setItem('serial', serial.toString());
    console.log('vamos para pagina editar con serial=', serial);
    this.router.navigate(['/editar', serial]);
  }
  btnCancel(){
    this.reload();
  }

  /************ EDITAR **************/
  btnEditar(serial: string) {
    this.submit = true;
    this.subscription = this.auth.getEquipo(serial).subscribe((data: any) => {
      this.equipoArray = data;
      console.log('info user =>');
      console.log(this.equipoArray);
      this.decomposicion = this.equipoArray.map(item => {
        this.infoEquipo.id = item.id;
        this.infoEquipo.serialNumber = item.serialNumber;
        this.infoEquipo.nombreEquipo = item.nombreEquipo;
        this.infoEquipo.descripcion = item.descripcion;
        this.infoEquipo.emailCliente = item.emailCliente;
        this.infoEquipo.lastConn = item.lastConn;
      });
    });
  }

  onSubmitCreat(){
    console.log('BTN_Grabar datos');
    this.infoEquipo.serialNumber = this.formulario.value.equipoData.serialNumber;
    this.infoEquipo.nombreEquipo = this.formulario.value.equipoData.nombreEquipo;
    this.infoEquipo.descripcion = this.formulario.value.equipoData.descripcion;
    this.infoEquipo.emailCliente = this.formulario.value.equipoData.emailCliente;
    this.infoEquipo.lastConn = formatDate(this.today, 'dd-MM-yyyy hh:mm:ss a', 'es-ES', '+01');
    const serial = this.infoEquipo.serialNumber;
//    console.log('Data y hora=>' + this.equipo.lastConn );
    this.subscription = this.auth.putEquipo(this.infoEquipo).subscribe(() => {
      this.myWebSocket.next({serial});
      Swal.fire('Informaciones del equipo editadas con éxito!', '', 'success');
      this.reload();
    }, (err: any) => {
      console.error(err);
      Swal.fire('Error',
          ''+ err.message ,
          'error');
    });
  }
  btnBorrar(id: string) {
    console.log('BTN_Borrar');
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Al borrar no podrás recuperar el equipo',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si si, lo borre!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.subscription = this.auth.delEquipo(id).subscribe(() => {
          Swal.fire('Equipo borrado con éxito!', '', 'success');
          this.reload();
        }, err => {
          console.error(err);
          Swal.fire(err.errorMessage);
        });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'su equipo está seguro',
            'info'
        )
      }
    })
  }

  btnDetalles(serial: string, tipo: string){
    if (tipo === 'mySH Box'){
      console.log('vamos para pagina editar con serial=', serial);
      this.router.navigate(['/equipo', serial]);
    }
    if (tipo === 'mySH App Alarm'){
      this.router.navigate(['/alarm', serial]);
    }


  }

  /************ Mudar ON OFF por la pagina web **************/
  onSubmitON(serial: string) {
    this.onoff.serialNumber = serial;
    this.onoff.onoff = '0';

    this.subscription = this.auth.onoff(this.onoff).subscribe((data: any) => {
      const msdn = '{serial:'+serial+'}';
      this.myWebSocket.next(msdn);
      Swal.fire('Comando ejecutado con éxito!', '', 'success');
      this.submit = false;
      this.reload();
    }, (error) => {
      Swal.fire('Error al ejecutar comando!', '', error);
    });
  }

  onSubmitOFF(serial: string) {
    this.onoff.serialNumber = serial;
    this.onoff.onoff = '1';

    this.subscription = this.auth.onoff(this.onoff).subscribe((data: any) => {
      const msdn = '{serial:'+serial+'}';
      this.myWebSocket.next(msdn);
      Swal.fire('Comando ejecutado con éxito!', '', 'success');
      this.submit = false;
      this.reload();
    }, (error) => {
      Swal.fire('Error al ejecutar comando!', '', error);
    });
  }

  reload() {
    this.submit = false;
    console.log('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.subscription.unsubscribe();
  }
}
