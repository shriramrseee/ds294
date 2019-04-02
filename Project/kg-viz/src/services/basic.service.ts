import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BasicService {

  url = 'http://10.24.24.214:3000/';

  constructor(private http: HttpClient) {
  }

  getLimitedRows(k : number) {
    return this.http.get(this.url + "yagofacts?limit=" + k);
  }

  getVertex(name: string) {
    // return this.http.get(this.url + "?subject=like."+name)
    return this.http.get(this.url + "rpc/getvertex?vertex="+name)
  }

  getProp(name: string) {
    return this.http.get(this.url + "rpc/getprop?vertex="+name)
  }

  getRelated(name: string) {
    return this.http.get(this.url + "rpc/getrelated?vertex="+name)
  }

}
