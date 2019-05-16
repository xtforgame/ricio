export type CancelReason = string | null;
export interface ICancelToken {
  setHandled : Function;
  setCancelFunc: (cancelFunc : Function) => any;
  cancel: (reason : CancelReason) => any;
}

// export type CancelReason = string | null;

export class CancelToken implements ICancelToken {
  canceled : boolean;
  cancelReason : CancelReason;
  cancelFunc : Function | null;

  constructor() {
    this.canceled = false;
    this.cancelReason = null;
    this.cancelFunc = null;
  }

  setHandled() {
    this.canceled = true;
  }

  setCancelFunc(cancelFunc : Function) {
    this.cancelFunc = cancelFunc;
    if (this.canceled) {
      (<Function>this.cancelFunc)(this.cancelReason);
    }
  }

  cancel(reason : CancelReason) {
    if (this.canceled) {
      return ;
    }
    this.cancelReason = reason;
    if (this.cancelFunc) {
      this.cancelFunc(this.cancelReason);
    }
    this.setHandled();
  }
}

export default (promise : Promise<any>, cancelToken? : ICancelToken) => {
  let handled : boolean = false;
  let needCancel : boolean = false;
  let cancelReason : CancelReason = null;
  let rejectFuc : Function | null = null;

  const wrappedPromise = new Promise<any>((resolve : any, reject : any) => {
    rejectFuc = reject;
    promise.then((val : any) => {
      if (handled) return ;
      handled = true;
      needCancel ? reject({ cancelReason, isCanceled: true }) : resolve(val);
    })
    .catch((error : Error) => {
      if (handled) return ;
      handled = true;
      needCancel ? reject({ cancelReason, isCanceled: true }) : reject(error);
    });
  });

  const cancel = (reason : CancelReason) => {
    if (handled) return ;
    if (rejectFuc) {
      rejectFuc({ cancelReason: reason, isCanceled: true });
      handled = true;
    } else {
      cancelReason = reason;
      needCancel = true;
    }
    cancelToken && cancelToken.setHandled();
  };

  cancelToken && cancelToken.setCancelFunc(cancel);

  return {
    cancel,
    promise: wrappedPromise,
  };
};
