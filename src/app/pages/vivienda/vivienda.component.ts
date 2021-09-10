import {ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService, Vivienda} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import {formatDate} from '@angular/common';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-vivienda',
  templateUrl: './vivienda.component.html',
  styles: [
  ]
})
export class ViviendaComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viviendaArray = [];
  decomposicion: any[] = [];
  formulario: FormGroup;
  status = false;
  submit: boolean;
  creat: boolean;

  vivienda: Vivienda = {
  id: 0,
  nombreVivienda: '',
  emailCliente: '',
  pais: '',
  ciudad: '',
  ubicacion: '',
  codigoPostal: '',
  }
  protected subscription: Subscription;

  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute) {

    this.subscription = this.route.params.subscribe(param => {
      this.vivienda.id = param.id;
      if (this.vivienda.id !== undefined){
        this.submit = true;
        this.btnEditar(this.vivienda.id.toString());
      }
    });
    this.auth.getAllViviendas().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      console.log('Viviendas => ');
      console.log(data);
      this.viviendaArray = data;
    }, (errorServicio) => {
      console.log(errorServicio);
      Swal.fire('Error al buscar viviendas');
    });

    this.formulario = new FormGroup({
      viviendaData: new FormGroup({
        id: new FormControl(null, null),
        nombreVivienda: new FormControl(null, [Validators.required]),
        emailCliente: new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        pais: new FormControl(null, null),
        ciudad: new FormControl(null, null),
        ubicacion: new FormControl(null, null),
        codigoPostal: new FormControl(null, null),
      })
    });

    this.route.params.subscribe(param => {
      this.vivienda.emailCliente = param.emailCliente;
      if (this.vivienda.emailCliente !== undefined){
        console.log('Estoy en viviendas recibindo parametro desde otra pagina');
        this.btnEditar(this.vivienda.emailCliente)
      }
    });
  }
  @ViewChild('f', {static: false}) FormGroup: NgForm;

  ngOnInit(): void {
    this.submit = false;
    this.creat = false;
  }
  /************ EDITAR **************/
  btnEditar(id: string) {
    this.submit = true;
    this.creat = false;
    this.auth.getOneVivienda(id).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.viviendaArray = data;
      console.log('Vivienda informacion =>');
      console.log(this.viviendaArray);
      this.decomposicion = this.viviendaArray.map(item => {
        this.vivienda.id = item.id;
        this.vivienda.nombreVivienda = item.nombreVivienda;
        this.vivienda.emailCliente = item.emailCliente;
        this.vivienda.ciudad = item.ciudad;
        this.vivienda.pais = item.pais;
        this.vivienda.ubicacion = item.ubicacion;
        this.vivienda.codigoPostal = item.codigoPostal;
      });
    });
  }

  btnAnadirVivienda(){
    this.submit = true;
    this.creat = true;
    console.log('btnAnadirVivienda');
  }

  onSubmitCreat(){
    console.log('ON Submit Creat Vivienda');
    this.vivienda.nombreVivienda = this.formulario.value.viviendaData.nombreVivienda;
    this.vivienda.pais = this.formulario.value.viviendaData.pais;
    this.vivienda.ciudad = this.formulario.value.viviendaData.ciudad;
    this.vivienda.ubicacion = this.formulario.value.viviendaData.ubicacion;
    this.vivienda.emailCliente = this.formulario.value.viviendaData.emailCliente;
    this.vivienda.codigoPostal = this.formulario.value.viviendaData.codigoPostal;

    if (this.creat) {
      this.auth.postVivienda(this.vivienda).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        Swal.fire('Vivienda registrada con éxito!');
        this.creat = false;
        this.reload();
      }, (err: any) => {
        console.log('err=>');
        console.log(err);
        Swal.fire('Error',
            ''+ err.message ,
            'error');
      });
    }else {
      this.auth.putVivienda(this.vivienda).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        Swal.fire('Vivienda editada con éxito!');
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

  btnBorrar(id: string) {
    console.log('BTN_Borrar');
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Al borrar no podrás recuperar la vivienda',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si si, la borro!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.auth.delVivienda(id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          Swal.fire('Vivienda borrada con éxito!');
          this.reload();
        }, (err: any) => {
          console.log('err=>');
          console.log(err);
          Swal.fire('Error',
              ''+ err.message ,
              'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'su vivienda está segura',
            'error'
        )
      }
    })
  }
  btnDetalles(nombreVivienda: string){
    console.log('vamos para pagina habitacion con nombre vivienda=', nombreVivienda);
    this.router.navigate(['/habitacion', nombreVivienda]);
  }
  reload() {
    this.submit = false;
    console.log('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
