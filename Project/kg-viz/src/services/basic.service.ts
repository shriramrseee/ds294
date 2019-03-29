import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BasicService {

  url = 'http://10.24.24.214:3000/yagofacts';

  constructor(private http: HttpClient) {
  }

  getLimitedRows(k : number) {
    return this.http.get(this.url + "?limit=" + k);
  }

  getVertex(name: string) {
    return this.http.get(this.url + "?subject=like."+name+"")
  }

}
