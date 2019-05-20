import ws from 'ws';
export interface IWsPeer {
  send(...args : any[]) : any;
}

export interface IWsPeerManager<WsPeer extends IWsPeer = ws> {
  wsPeerMap: Map<any, WsPeer>;
}

export class EmptyWsPeerManager<WsPeer> {
  wsPeerMap : Map<any, WsPeer>;
  constructor() {
    this.wsPeerMap = new Map<any, WsPeer>();
  }
}

export class EmptyWsPeer {
  send(...args : any[]) : any {
  }
}
