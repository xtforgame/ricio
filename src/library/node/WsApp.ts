export default class WsApp {
  middlewares : any[];

  constructor() {
    this.middlewares = [];
  }

  use(middleware : any) {
    this.middlewares.push(middleware);
  }

  _run(ctx : any, index = 0) {
    if (index >= this.middlewares.length) {
      return Promise.resolve(null);
    }
    return Promise.resolve()
    .then(() => {
      const next = () => {
        return this._run(ctx, index + 1);
      };
      return this.middlewares[index](ctx, next);
    });
  }

  callback = () => (ctx : any) => {
    return this._run(ctx);
  }
}
