import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, Habitacion, Vivienda} from '../../services/authentication.service';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
import Swal from 'sweetalert2';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-habitacion',
  templateUrl: './habitacion.component.html',
  styles: [
  ]
})
export class HabitacionComponent implements OnInit, OnDestroy  {
  private ngUnsubscribe = new Subject();
  componentDestroyed$: Subject<boolean> = new Subject()
  emailCliente = '';
  nombreVivienda='';
  userArray = [];
  viviendaArray = [];
  habitacionArray = [];
  decomposicion: any[] = [];
  decomposicion2: any[] = [];
  submit: boolean;
  creat: boolean;
  formulario: FormGroup;
  nombresProhibidos = ['Test', 'test', 'TEST', 'Prueba', 'prueba', 'PRUEBA'];

  protected subscription: Subscription;
  habitacion: Habitacion = {
    id: 0,
    nombreVivienda: '',
    nombreHabitacion: '',
    serialNumber: '',
  };
  vivienda: Vivienda = {
    id: 0,
    nombreVivienda: '',
    emailCliente: '',
    pais: '',
    ciudad: '',
    ubicacion: '',
    codigoPostal: '',
  };
  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute) {
    this.subscription = this.route.params.subscribe(param => {
      this.nombreVivienda = param.nombreVivienda;
          console.log (' nombre vivienda => ', this.nombreVivienda);
    });
    this.formulario = new FormGroup ({
      habitacionData: new FormGroup( {
        id: new FormControl(null, null),
        nombreVivienda: new FormControl(null, [Validators.required, this.esProhibido.bind(this)]),
        nombreHabitacion: new FormControl(null, [Validators.required, this.esProhibido.bind(this)]),
        serialNumber: new FormControl(null, null)
      })
    })
    this.auth.getHabitacionesVivienda(this.nombreVivienda).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.habitacionArray = data;
      console.log (' habitaciones=> ');
      console.log (data);
    });
    this.auth.getViviendabyname(this.nombreVivienda).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.viviendaArray = data;
      console.log (' vivienda => ');
      console.log (data);
      this.decomposicion2 = this.viviendaArray.map(item => {
        this.vivienda.id = item.id;
        this.vivienda.nombreVivienda = item.nombreVivienda;
        this.vivienda.emailCliente = item.emailCliente;
        this.vivienda.pais = item.pais;
        this.vivienda.ciudad = item.ciudad;
        this.vivienda.ubicacion = item.ubicacion;
        this.vivienda.codigoPostal = item.codigoPostal;
      });
    });
/*
    this.auth.getHabitacionesCliente(this.emailCliente).pipe(takeUntil(this.ngUnsubscribe)).subscribe(  (data: any) => {
      this.habitacionArray = data;
      console.log (' habitaciones=> ');
      console.log (data);
    });
        this.auth.getOneVivienda(this.emailCliente).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.viviendaArray = data;
      console.log(data);
      this.decomposicion2 = this.viviendaArray.map(item => {
        this.vivienda.id = item.id;
        this.vivienda.nombreVivienda = item.nombreVivienda;
        this.vivienda.pais = item.pais;
        this.vivienda.ciudad = item.ciudad;
        this.vivienda.ubicacion = item.ubicacion;
        this.vivienda.codigoPostal = item.codigoPostal;
      });
    })

    this.auth.getOneUser(this.emailCliente).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.userArray = data;
    });
*/
  }

  ngOnInit(): void {
    this.submit = false;
    this.creat = false;
  }
  btnEditarVivienda(emailCliente: string){
    console.log('vamos para pagina editar con emailCliente=', emailCliente);
    this.router.navigate(['/vivienda', emailCliente]);
  }
  btnAnadirHabitacion(){
    this.submit = true;
    this.creat = true;
    this.habitacionArray.forEach((item) => {
      if (item.serialNumber === null){
        Swal.fire('Antes de Crear nueva habitacion, añada un equipo a habitacion existente', '', 'error');
      this.reload();
      }
    });
  }

  btnEditarHabitacion(nombreHabitacion: string){
    this.submit = true;
    this.creat = false;
    this.auth.getOneHabitacionVivienda(nombreHabitacion).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.habitacionArray = data;
      console.log('info habitacion =>');
      console.log(this.habitacionArray);
      this.decomposicion = this.habitacionArray.map(item => {
        this.habitacion.id = item.id;
        this.habitacion.nombreVivienda = item.nombreVivienda;
        this.habitacion.nombreHabitacion = item.nombreHabitacion;
        this.habitacion.serialNumber = item.serialNumber;
      });
    });
  }
  onSubmitCreat(){
    this.habitacion.id = this.formulario.value.habitacionData.id;
    this.habitacion.nombreVivienda = this.formulario.value.habitacionData.nombreVivienda;
    this.habitacion.nombreHabitacion = this.formulario.value.habitacionData.nombreHabitacion;
    this.habitacion.serialNumber = this.formulario.value.habitacionData.serialNumber;
    if(this.habitacion.serialNumber === '') this.habitacion.serialNumber = null;

    if (this.creat) {
      this.auth.postHabitacion(this.habitacion).pipe(takeUntil(this.componentDestroyed$)).subscribe((data: any) => {
        Swal.fire('habitacion añadida con éxito!');
        this.creat = false;
        this.reload();
      }, (err: any) => {
        console.log('err=>');
        console.log(err);
        Swal.fire('Error',
            '' + err.message,
            'error');
      });
    }else {
      this.auth.putHabitacion(this.habitacion).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        Swal.fire('Habitacion editada con éxito!');
        this.reload();
      }, (err: any) => {
        console.log('err=>');
        console.log(err);
        Swal.fire('Error',
            ''+ err.message ,
            'error');
      });
    }
  }
  esProhibido(nombre: FormControl): {[s: string]: boolean} {
    if (this.nombresProhibidos.indexOf(nombre.value) !== -1) {
      return  {nombreEsProhibido: true};
    }
    return null;
  }
  btnBorrarHabitacion(nombreHabitacion: string){
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Al borrar no podrás recuperar la habitacion',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si si, la borro!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.auth.delHabitacion(nombreHabitacion).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          Swal.fire('Habitacion borrada con éxito!');
          this.reload();
        }, err => {
          console.error(err);
          Swal.fire('Error', '' + err.message, 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'La habitacion está segura',
            'info'
        )
      }
    })
  }

  public reload() {
    this.submit = false;
    console.error('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.componentDestroyed$.next(true)
    this.componentDestroyed$.complete()
  }
}
