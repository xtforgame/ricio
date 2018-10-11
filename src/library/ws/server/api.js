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
          try {
            this.wsPeer.emit('error', error);
            // this.wsPeer.close(1005, 'Unable to send data'); // the `ws` pcakage treat 1005 as an invalid code for input
            this.wsPeer.close(3005, 'Unable to send data');
          } catch (error) {
            return reject(error);
          }
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
