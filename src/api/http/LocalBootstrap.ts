import {Api} from '../Api';

import * as httpClient from './HttpClientFetch';
import { ApiError } from '../../ApiError';
import { Transport } from './Transport';
import { HueApiRateLimits } from '../HueApiRateLimits';

import { ConfigParameters } from '../HueApiConfig';
import { cleanHostname, getHttpsUrl } from './urlUtil';
import { time } from '@peter-murray/hue-bridge-model';

export class LocalBootstrap {

  readonly baseUrl: URL;

  readonly hostname: string;

  readonly rateLimits: HueApiRateLimits;

  /**
   * Create a Local Network Bootstrap for connecting to the Hue Bridge. The connection is ALWAYS over TLS/HTTPS.
   *
   * @param {String} hostname The hostname or ip address of the hue bridge on the local network.
   * @param {number=} port The port number for the connections, defaults to 443 and should not need to be specified in the majority of use cases.
   */
  constructor(hostname: string, rateLimits: HueApiRateLimits, port?: number) {
    this.baseUrl = getHttpsUrl(hostname, port || 443);
    this.hostname = cleanHostname(hostname);
    this.rateLimits = rateLimits;
  }

  /**
   * Connects to the Hue Bridge using the local network.
   *
   * The connection will perform checks on the Hue Bridge TLS Certificate to verify it is correct before sending any
   * sensitive information.
   *
   * @param {String=} username The username to use when connecting, can be null, but will severely limit the endpoints that you can call/access
   * @param {String=} clientkey The clientkey for the user, used by the entertainment API, can be null
   * @param {Number=} timeout The timeout for requests sent to the Hue Bridge. If not set will default to 20 seconds.
   * @returns {Promise<Api>} The API for interacting with the hue bridge.
   */
  connect(username?: string, clientkey?: string, timeout?: number): Promise<Api> {
    const self = this
      , hostname: string = self.hostname
      , baseUrl: string = self.baseUrl.href
    ;

    return httpClient.request({
        method: 'GET',
        url: `${baseUrl}api/config`,
        json: true,
        timeout: getTimeout(timeout),
      }).then(res => {
        const bridgeId = res.data.bridgeid.toLowerCase();

            const apiBaseUrl = `${baseUrl}api`
              , fetchConfig = {
                  baseURL: apiBaseUrl,
                  timeout: getTimeout(timeout)
                }
              , transport = new Transport(httpClient.create(fetchConfig), this.rateLimits.transportRateLimit, username)
              , config: ConfigParameters = {
                  remote: false,
                  baseUrl: apiBaseUrl,
                  bridgeName: this.hostname,
                  clientKey: clientkey,
                  username: username,
                }
            ;

            return new Api(config, transport, this.rateLimits);
          });
  }
}

function getTimeout(timeout?: number): number {
  return timeout || 20000;
}
