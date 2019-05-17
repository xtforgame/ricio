import WsProtocolApiBase from '../api-base';
import { RawData, WsMessageConfig } from '../../ws/index';
import { ICancelToken } from '../../utils/makeCancelable';
export interface IEventEmitter {
    addListener(event: string, listener: Function): IEventEmitter;
    on(event: string, listener: Function): IEventEmitter;
    once(event: string, listener: Function): IEventEmitter;
    removeListener(event: string, listener: Function): IEventEmitter;
    removeAllListeners(event?: string): IEventEmitter;
    setMaxListeners(n: number): void;
    listeners(event: string): Function[];
    emit(event: string, ...args: any[]): boolean;
}
export interface IEventEmitterClass {
    new (...args: any[]): IEventEmitter;
}
interface PromiseInfo {
    promise: Promise<any> | null;
    isFulfilled?: boolean;
    resolve?: ((arg: any) => any);
    reject?: ((arg: any) => any);
}
interface OpenAsyncInfo extends PromiseInfo {
}
export declare class WebsocketApi {
    url: string;
    EventEmitter: IEventEmitterClass;
    socket: WebSocket | null;
    state: string;
    nativeEvents: IEventEmitter;
    binaryType: BinaryType;
    openAsyncInfo: OpenAsyncInfo;
    constructor(url: string | undefined, EventEmitter: IEventEmitterClass);
    close(code?: number, reason?: string): Promise<any>;
    open(url?: string): Promise<any>;
    send(msg: string | ArrayBufferLike | Blob | ArrayBufferView): Promise<void>;
    listenNative(events: string | {
        [s: string]: Function;
    }, cb?: Function): IEventEmitter | IEventEmitter[];
    unlistenNative(events: string | {
        [s: string]: Function;
    }, cb?: Function): IEventEmitter | IEventEmitter[];
}
interface LastReconnect extends PromiseInfo {
    time: number;
    count: number;
}
export declare type WaitResPromises = {
    [n: number]: any;
};
export declare type RequestOptions = {
    timeout?: number;
    cancelToken?: ICancelToken;
};
export declare type WsProtocolApiOptions = {
    reconnection: boolean;
    reconnectionDelay: number;
    reconnectionAttempts: number;
};
export default class WsProtocolApi extends WsProtocolApiBase<WebsocketApi> {
    EventEmitter: IEventEmitterClass;
    options: WsProtocolApiOptions;
    events: IEventEmitter;
    lastReconnect: LastReconnect | null;
    waitResPromises: WaitResPromises;
    wsMsgCounter: number;
    constructor(url: string | undefined, EventEmitter: IEventEmitterClass, options?: Object);
    readonly nativeEvents: IEventEmitter;
    stopReconnect(reason: any): void;
    reconnect(url: string): Promise<any>;
    open(url: string): Promise<any>;
    _open(url: string): Promise<any>;
    close(): Promise<void>;
    request(msgConfig: WsMessageConfig, options?: RequestOptions): Promise<any>;
    sendAndWaitResponse(msgConfig: WsMessageConfig, { timeout, cancelToken }?: RequestOptions): Promise<any>;
    wsOnMessage: ({ data: rawData }: {
        data: RawData;
    }, ws: any) => void;
}
export {};
