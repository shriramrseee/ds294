export class yago {

  public id: string;
  public subject: string;
  public predicate: string;
  public object: string;
  public value: number;

  constructor(y) {
    this.id = y['id'];
    this.subject = y['subject'];
    this.predicate = y['predicate'];
    this.object = y['object'];
    this.value = y['value'];
  }

}
