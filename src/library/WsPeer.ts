export interface IWsPeer {
  send(...args : any[]) : any;
}

export class EmptyWsPeer {
  send(...args : any[]) : any {
  }
}
