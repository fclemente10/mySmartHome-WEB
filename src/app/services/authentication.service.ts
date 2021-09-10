import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, mapTo} from 'rxjs/operators';
import {Router} from '@angular/router';

export interface UserDetails {
    exp: number;
    id: number;
    email: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    tipo: ['Admin', 'Usuario'];
}

export interface Vivienda {
    id: number;
    nombreVivienda: string;
    emailCliente: string;
    pais: string;
    ciudad: string;
    ubicacion: string;
    codigoPostal: string;
}

export interface Habitacion {
    id: number;
    nombreVivienda: string;
    nombreHabitacion: string;
    serialNumber: string;
}
export interface InfoEquipo {
    id: number;
    serialNumber: string ;
    nombreEquipo: string;
    descripcion: string;
    emailCliente: string;
    lastConn: string;
}
export interface Arduino {
    id: string;
    serialNumber: string;
    onoff: string;
    accion: string;
    horaInicio: string;
    horaFinal: string;
}
export interface Datos {
    id: number;
    serialNumber: string;
    dataTime: string;
    tension: string;
    corriente: string;
    on: string;
    off: string;
}

interface TokenResponse {
    token: string;
}
export interface TokenPayload {
    email: string;
    contrasena: string;
}

export interface Onoff {
    serialNumber: string;
    onoff: string;
}

export const ip = '2.139.215.161:3000'; //'192.168.56.1:3000';  //'2.139.215.161:3000' //'api.mysh.es'
    // '192.168.56.1'; // 'ec2-15-236-19-45.eu-west-3.compute.amazonaws.com';
 // '192.168.56.1';//'ec2-35-180-204-107.eu-west-3.compute.amazonaws.com'  //  '192.168.0.61'; // '192.168.0.61';'192.168.1.232';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    constructor(private http: HttpClient,
                private router: Router) {
    }

    private token: string;

    private saveToken(token: string): void {
        localStorage.setItem('userToken', token);
        this.token = token;
    }
    private getToken(): string {
        if (this.token) {
            this.token = localStorage.getItem('userToken');
        }
        return this.token;
    }
    public getUserDetails(): UserDetails {
        const token = this.getToken();
        let payload;
        if (token) {
            payload = token.split('.')[1];
            payload = window.atob(payload);
            //   console.log('Payload= ' + payload)
            return JSON.parse(payload);
        } else {
            return null;
        }
    }

    public isLoggedIn(): boolean {
        const user = this.getUserDetails();
        if (user) {
            return user.exp > Date.now() / 1000;
        } else {
            return false;
        }
    }
    /************************LOGIN ************************/
    public login(user: TokenPayload): Observable<any> {

        const base = this.http.post(`http://` + ip + `/api/v1/login`, user);
        const request = base.pipe(
            map((data: string) => {
                console.log('data= >');
                console.log(data);
                if (data) {
                    this.saveToken(data);
                }
                return data;
            })
        );
        return request;
    }

    /************************USUARIO************************/
    public profile(email: string): Observable<any> {
        console.log('call profile');
        const datos = this.http.get(`http://` + ip + '/api/v1/usuario/' + email, {
        });
        return datos;
    }

    public logout(): void {
        this.token = '';
        window.localStorage.removeItem('usertoken');
        this.router.navigateByUrl('/home');
    }
    public getUsuarios(): Observable<any> {
        return this.http.get( `http://` + ip +`/api/v1/usuario`);
    }
    public getUsu(): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/usuario`);
    }
    public getOneUser(email: string): Observable<any> {
        return this.http.get( `http://` + ip + `/api/v1/usuario/` + email);
    }
    public delUsuario(email: string): Observable<any> {
        return this.http.delete( `http://` + ip + `/api/v1/usuario/` + email);
    }
    public register(user: UserDetails): Observable<any> {
        return this.http.post(  `http://` + ip + `/api/v1/usuario`, user);
    }
    public putUsuario(user: UserDetails): Observable<any> {
        return this.http.put( `http://` + ip + `/api/v1/usuario`, user
        );
    }
    /* ######################### EQUIPOS ######################### */
    public getDevices(): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/infoequipo`);
    }
    /************************Buscar equipos de un usuario************************/
    public getEquiposUsuario(emailCliente: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/infoequipos/` + emailCliente);
    }
    /************************Buscar equipo unico************************/
    public getEquipo(serial: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/infoequipo/` + serial);
    }
    /************************Borrar Equipo************************/
    public delEquipo(serial: string ): Observable<any>  {
        console.log('call Borrar Equipo');
        return this.http.delete(`http://` + ip + `/api/v1/infoequipo/` + serial);
    }
    /************************Actualizar Equipo************************/
    public putEquipo(infoEquipo: InfoEquipo): Observable<any> {
        return this.http.put(`http://` + ip + `/api/v1/infoequipo/`, infoEquipo);
    }

    /************************Añade Equipo************************/
    public postEquipo(infoEquipo: InfoEquipo): Observable<any> {
        return this.http.post(`http://` + ip + `/api/v1/infoequipo`, infoEquipo);
    }

    /***************>>>>>>>>>>>>>>OPERACIONES ARDUINO>>>>>>>>>>>***************/
    public getArduinos(): Observable<any>{
        return this.http.get(`http://` + ip + `/api/v1/equipo`);
    }
    public getArduino(serial: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/equipo/` + serial);
    }
    /**** POST UTILIZADO SOLAMENTE POR LA APLICACION CONECTADA AL ARDUINO - DONDE EMPIEZA all
     public postArduino(arduino: Arduino): Observable<any> {
    return this.http.post(`http://` + this.ip + `/api/v1/equipo/`, arduino);
  }
     ****/
    public putArduino(arduino: Arduino): Observable<any> {
        console.log('PUT Arduin0 =>');
        console.log(arduino);
        return this.http.put(`http://` + ip + `/api/v1/equipo`, arduino);
    }
    public delArduino(serial: string): Observable<any> {
        return this.http.delete(`http://` + ip + `/api/v1/equipo/` + serial);
    }
    /************************Comando ON OFF************************/
    public enchufadoQuitado(enchufadoQuitado: Onoff): Observable<any> {
        return this.http.put(`http://` + ip + `/api/v1/onoff`, enchufadoQuitado);
    }
    /************************Actualizar Vivienda ************************/
    public onoff(enchufadoQuitado: Onoff): Observable<any> {
        return this.http.put(`http://` + ip + `/api/v1/onoff/`, enchufadoQuitado);
    }

    /* ############################ Metodos VIVIENDAS ################################ */

    public getAllViviendas(): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/vivienda`);
    }
    /************************Buscar viviendas de diferentes maneras ************************/
    public getOneVivienda(id: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/vivienda/` + id);
    }
    public getViviendasCliente(nombreVivienda: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/viviendas/` + nombreVivienda);
    }
    public getViviendabyname(nombreVivienda: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/viviendabyname/` + nombreVivienda);
    }
    /************************Borrar vivienda y habitaciones ************************/
    public delVivienda(nombreVivienda: string ): Observable<any>  {
        console.log('call Borrar Vivienda');
        return this.http.delete(`http://` + ip + `/api/v1/vivienda/` + nombreVivienda);
    }
    /************************Actualizar Vivienda ************************/
    public putVivienda(vivienda: Vivienda): Observable<any> {
        return this.http.put(`http://` + ip + `/api/v1/vivienda`, vivienda);
    }
    /************************ Añade una vivienda ************************/
    public postVivienda(vivienda: Vivienda): Observable<any> {
        return this.http.post(`http://` + ip + `/api/v1/vivienda`, vivienda);
    }

    /* ############################ Metodos HABITACION ################################ */
    public getAllHabitaciones(): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/habitacion`);
    }
    public getOneHabitacionVivienda(nombreHabitacion: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/habitacion/` + nombreHabitacion);
    }
    /************************Buscar todas habitaciones de un cliente************************/
    public getHabitacionesCliente(emailCliente: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/habitaciones/` + emailCliente);
    }
    /************************ Buscar todas habitaciones de una Vivienda ************************/
    public getHabitacionesVivienda(nombreVivienda: string): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/habVivienda/` + nombreVivienda);
    }
    /************************Borrar vivienda y habitaciones ************************/
    public delHabitacion(nombre: string ): Observable<any>  {
        console.log('call Borrar Equipo');
        return this.http.delete(`http://` + ip + `/api/v1/habitacion/` + nombre);
    }
    /************************Actualizar Vivienda ************************/
    public putHabitacion(habitacion: Habitacion): Observable<any> {
        return this.http.put(`http://` + ip + `/api/v1/habitacion/`, habitacion);
    }
    /************************ Añade una vivienda ************************/
    public postHabitacion(habitacion: Habitacion): Observable<any> {
        return this.http.post(`http://` + ip + `/api/v1/habitacion`, habitacion);
    }
    public getAlarm(): Observable<any> {
        return this.http.get(`http://` + ip + `/api/v1/alarm/`);
    }
    public delAlarm(serial: string): Observable<any> {
        return this.http.delete(`http://` + ip + `/api/v1/alarm/`+ serial);
    }

}
