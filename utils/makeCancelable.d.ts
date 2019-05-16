export declare type CancelReason = string | null;
export interface ICancelToken {
    setHandled: Function;
    setCancelFunc: (cancelFunc: Function) => any;
    cancel: (reason: CancelReason) => any;
}
export declare class CancelToken implements ICancelToken {
    canceled: boolean;
    cancelReason: CancelReason;
    cancelFunc: Function | null;
    constructor();
    setHandled(): void;
    setCancelFunc(cancelFunc: Function): void;
    cancel(reason: CancelReason): void;
}
declare const _default: (promise: Promise<any>, cancelToken?: ICancelToken | undefined) => {
    cancel: (reason: string | null) => void;
    promise: Promise<any>;
};
export default _default;
