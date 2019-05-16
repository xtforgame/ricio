export default class WsApp {
    middlewares: any[];
    constructor();
    use(middleware: any): void;
    _run(ctx: any, index?: number): Promise<any>;
    callback: () => (ctx: any) => Promise<any>;
}
