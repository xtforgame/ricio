import { AzWsMessage } from '../../ws';
import ApiBase from '../api-base';

class WsProtocolApi extends ApiBase {
  open() {
    return Promise.resolve(this);
  }

  send(msgConfig) {
    const config = Object.assign({}, msgConfig, { method: 'SEND' });
    const msg = new AzWsMessage(config);
    return new Promise((resolve, reject) => {
      this.wsPeer.send(msg.build(), (error) => {
        if (error) {
          this.wsPeer.emit('error', error);
          this.wsPeer.close(1005, 'Unable to send data');
          return reject(error);
        }
        return resolve();
      });
    });
  }

  close(code, reason) {
    if(this.wsPeer) {
      this.wsPeer.close(code, reason);
    }
  }
}

export default WsProtocolApi;
