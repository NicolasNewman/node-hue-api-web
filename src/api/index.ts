import { LocalBootstrap } from './http/LocalBootstrap';
import { LocalInsecureBootstrap } from './http/LocalInsecureBootstrap';
import { HueApiRateLimits } from './HueApiRateLimits';

const DEFAULT_RATE_LIMIT_CONFIG = new HueApiRateLimits();

/**
 * Creates a local network bootstrap to connect with Hue bridge on a local network.
 * @param host The IP Address or FQDN of the he bridge you are connecting to.
 * @param port The port number to connect to, optional.
 */
export function createLocal(host: string, port?: number, rateLimits?: HueApiRateLimits): LocalBootstrap {
  return new LocalBootstrap(host, rateLimits || DEFAULT_RATE_LIMIT_CONFIG, port);
}

/**
 * Creates a local network bootstrap over an insecure HTTP connection.
 * @param host The IP Address or FQDN of the he bridge you are connecting to.
 * @param port The port number to connect to, optional.
 */
export function createInsecureLocal(host: string, port?: number, rateLimits?: HueApiRateLimits): LocalInsecureBootstrap {
  return new LocalInsecureBootstrap(host, rateLimits || DEFAULT_RATE_LIMIT_CONFIG, port);
}