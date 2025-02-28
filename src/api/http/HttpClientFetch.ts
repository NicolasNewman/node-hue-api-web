import HttpError from './HttpError';


type HttpClientFetchConfig = {
  headers?: Headers,
  baseURL?: string,
  timeout?: number,
}


export type RequestConfig = {
  json?: boolean
  data?: object | string
  url: string
  headers?: Headers
  method: string
  timeout?: number
  params?: { [key: string]: string }
  validateStatus?: Function,
  // transformResponse?: Function,
};

type FetchRequestConfig = {
  method?: string,
  headers?: Headers,
  timeout?: number,
  body?: any,
}

export type FetchResult = {
  status: number,
  data?: any
  config?: { [key: string]: any },
  headers?: Headers
}

export class HttpClientFetch {

  private _config: HttpClientFetchConfig;

  constructor(config?: HttpClientFetchConfig) {
    this._config = config || {};
  }

  get headers(): Headers {
    return this._config.headers || new Headers();
  }

  get baseURL(): string | undefined {
    return this._config.baseURL;
  }

  get hasBaseUrl(): boolean {
    return !!this.baseURL;
  }

  getTimeout(timeout: number | undefined): number {
    if (timeout !== undefined) {
      return timeout;
    }
    return this._config?.timeout || 0;
  }

  refreshAuthorizationHeader(token: string) {
    if (!this._config.headers) {
      this._config.headers = new Headers();
    }

    if (this._config.headers) {
      this._config.headers.set('Authorization', `Bearer ${token}`);
    }
  }

  getAgent(url: string, config: RequestConfig):  undefined {
    return undefined;
  }

  getUrl(url: string): string {
    if (!this.hasBaseUrl) {
      return url;
    } else if (/^http/.test(url)) {
      return url;
    }

    let path;
    if (url && url[0] === '/') {
      path = url;
    } else {
      path = `/${url}`;
    }
    return `${this.baseURL}${path}`;
  }

  request(req: RequestConfig): Promise<FetchResult> {
    const isJson = req.json === true
      , hasData = !!req.data
      , url = this.getUrl(req.url)
      , headers = this.headers
      , config: FetchRequestConfig = {
        method: req.method,
        headers: headers,
        timeout: this.getTimeout(req.timeout),
      }
    ;

    // We are setting the timeout on the HTTP(s) agent, but node-fetch does not appear to be respecting this setting
    // from the agent, so taking to explicitly extracting the timeout from the agent and setting it on the API call
    // if a timeout is not specified as part of the request.

    if (isJson) {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');

      if (hasData) {
        config.body = JSON.stringify(req.data);
      }
    } else {
      if (hasData) {
        config.body = req.data;
      }
    }

    if (req.headers) {
      const requestHeaders = req.headers;

      Object.keys(requestHeaders).forEach(header => {
        headers.set(header, requestHeaders.get('header') || '');
      });
    }

    if (req.params) {
      config.body = new URLSearchParams(req.params);
      headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    return fetch(url, config)
      .then((res: Response) => {
        if (req.validateStatus) {
          if (req.validateStatus(res.status)) {
            return res;
          }
        } else if (res.ok) {
          return res;
        }

        // Process the result and then return the error object
        return resolveBodyPromise(res)
          .then(data => {
            throw new HttpError(res.status, res.url, res.headers, data);
          });
      })
      .then((res: Response) => {
        const result: FetchResult = {
          status: res.status,
        };

        if (res.headers) {
          // @ts-ignore
          result.headers = res.headers;
        }

        return resolveBodyPromise(res)
          .then(data => {
            result.data = data;
            return result;
          });
      });
  }
}

function resolveBodyPromise(res: Response) {
    // The local bridge connection with nginx in front of it does not return a content-length header, unlike the remote API
  // so we cannot gate on this and prevent calls to res.json() from errorring on an empty string.
  //
  // This means we need to get it back as text and process it accordingly.
  // let promise;
  // const contentLength: string = res.headers.get('content-length');
  // if (contentLength && parseInt(contentLength) > 0) {
  //   const contentType = res.headers.get('content-type');
  //
  //   if (contentType.startsWith('application/json')) {
  //     promise = res.json();
  //   } else {
  //     promise = res.text();
  //   }
  // } else {
  //   promise = Promise.resolve();
  // }
  // return promise;

  return res.text()
    .then((data: string) => {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.startsWith('application/json')) {
        try {
          return JSON.parse(data)
        } catch (err) {
          return data;
        }
      }
      return data;
    });
}

export function create(config?: HttpClientFetchConfig): HttpClientFetch {
  return new HttpClientFetch(config);
}

export function request(req: RequestConfig): Promise<FetchResult> {
  return new HttpClientFetch().request(req);
}