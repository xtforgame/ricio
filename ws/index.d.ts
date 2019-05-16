export declare type Protocol = string | null;
export declare type Method = string | null;
export declare type Url = string | null;
export declare type Path = string | null;
export declare type MsgId = any;
export declare type HeaderMap = {
    [s: string]: string;
};
export declare type Status = string | number | null;
export declare type LightMsg = string | null;
export declare type PlainBody = Object | string | AzWsMsgBody | null;
export declare type Body = PlainBody | AzWsMsgBody;
export declare type NormalizedRawData = BufferType | null;
export declare type RawData = BinaryType | NormalizedRawData;
export declare type Params = {
    [s: string]: any;
};
export declare type Query = {
    [s: string]: any;
};
export declare type Local = {
    [s: string]: any;
};
export interface WsPeerInfo {
    server: any;
    ws: any;
    [s: string]: any;
}
export interface BinaryType {
    length: number;
}
export interface BufferType {
    [index: number]: number;
    slice: (start: number, end: number) => BufferType;
    length: number;
}
export interface SendHandler {
    send: Function;
    sendPromise: Function;
}
export interface WsMessage {
    status: Status;
    lightMsg: LightMsg;
    body: Body;
    build: Function;
}
export interface WsMessageConfig {
    protocol?: Protocol;
    rawData?: RawData;
    method?: Method;
    url?: Url;
    path?: Path;
    msgId?: MsgId;
    status?: Status;
    lightMsg?: LightMsg;
    headers?: HeaderMap;
    body?: Body;
    params?: Params;
    query?: Query;
    local?: Local;
    peerInfo?: WsPeerInfo;
}
export interface WsMessageClass {
    new (config: WsMessageConfig): WsMessage;
}
export declare function ab2str(buf: BufferType): string;
export declare function str2ab(str: string): ArrayBuffer;
export declare class AzWsMsgBody {
    rawData: NormalizedRawData;
    constructor(rawData?: any);
    toString(): string;
    getText(): string;
    text(): Promise<string>;
    getJson(): any;
    json(): Promise<any>;
}
export declare class AzWsResponse {
    sendHandler: SendHandler;
    msg: WsMessage;
    constructor(sendHandler: SendHandler, MsgClass: WsMessageClass, config: WsMessageConfig);
    status(status: Status): this;
    lightMsg(lightMsg: LightMsg): this;
    body(body: Body): this;
    build(body: Body): any;
    send(body: Body, cb: Function): any;
    sendPromise(body: Body): Promise<any>;
    throw(status: Status, message: LightMsg, _error?: any, options?: any, cb?: Function): any;
    throwPromise(status: Status, message: LightMsg, error?: any, options?: any): any;
}
export declare class AzWsMessage implements WsMessage {
    protocol: Protocol;
    rawData: RawData;
    method: Method;
    path: Path;
    msgId: MsgId;
    status: Status;
    lightMsg: LightMsg;
    headers: HeaderMap;
    body: Body;
    params: Params;
    query: Query;
    local: Local;
    peerInfo: WsPeerInfo;
    valid: boolean;
    constructor({ rawData, method, path, url, status, lightMsg, msgId, headers, body, peerInfo, local, }: WsMessageConfig);
    parseRawData(rawData: BinaryType): void;
    build(): string;
    genResponse(sendHandler: SendHandler): AzWsResponse;
}
