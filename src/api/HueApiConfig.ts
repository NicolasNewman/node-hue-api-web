import { ApiError } from '../ApiError';
import { Transport } from './http/Transport';

export type ConfigParameters = {
  baseUrl: string,
  bridgeName: string,
  username?: string,
  clientId?: string,
  clientSecret?: string,
  clientKey?: string,
  remote?: boolean
}

export class HueApiConfig {

  private _config: ConfigParameters;


  private readonly _transport: Transport;

  constructor(config: ConfigParameters, transport: Transport) {
    this._config = config;
    this._transport = transport;
  }

  /**
   * Gets the transport implementation that is used to connect with the Hue Bridge
   */
  get transport(): Transport {
    return this._transport;
  }

  /**
   * Gets the current username used to connect/interact with the Hue Bridge.
   */
  get username(): string| undefined {
    return this._config.username;
  }

  /**
   * The Base URL for communication with the bridge.
   * @returns The base URL for the hue bridge.
   */
  get baseUrl(): string {
    return this._config.baseUrl;
  }

  /**
   * Gets the name of the hue bridge.
   * @returns string The name for the bridge.
   */
  get bridgeName(): string {
    return this._config.bridgeName;
  }

  /**
   * Gets the client key for the entertainment API/streaming endpoints
   * @throws ApiError if the connection is not local network.
   */
  get clientKey(): string | undefined {
    return this._config.clientKey;
  }
}