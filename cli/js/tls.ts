// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import * as tlsOps from "./ops/tls.ts";
import { Listener, Transport, Conn, ConnImpl, ListenerImpl } from "./net.ts";

// TODO(ry) There are many configuration options to add...
// https://docs.rs/rustls/0.16.0/rustls/struct.ClientConfig.html
interface ConnectTLSOptions {
  transport?: Transport;
  port: number;
  hostname?: string;
  certFile?: string;
}

/**
 * Establishes a secure connection over TLS (transport layer security).
 */
export async function connectTLS({
  port,
  hostname = "127.0.0.1",
  transport = "tcp",
  certFile = undefined
}: ConnectTLSOptions): Promise<Conn> {
  const res = await tlsOps.connectTLS({
    port,
    hostname,
    transport,
    certFile
  });
  return new ConnImpl(res.rid, res.remoteAddr!, res.localAddr!);
}

class TLSListenerImpl extends ListenerImpl {
  async accept(): Promise<Conn> {
    const res = await tlsOps.acceptTLS(this.rid);
    return new ConnImpl(res.rid, res.remoteAddr, res.localAddr);
  }
}

export interface ListenTLSOptions {
  port: number;
  hostname?: string;
  transport?: Transport;
  certFile: string;
  keyFile: string;
}

/** Listen announces on the local transport address over TLS (transport layer security).
 *
 * @param options
 * @param options.port The port to connect to. (Required.)
 * @param options.hostname A literal IP address or host name that can be
 *   resolved to an IP address. If not specified, defaults to 0.0.0.0
 * @param options.certFile Server certificate file
 * @param options.keyFile Server public key file
 *
 * Examples:
 *
 *     Deno.listenTLS({ port: 443, certFile: "./my_server.crt", keyFile: "./my_server.key" })
 */
export function listenTLS({
  port,
  certFile,
  keyFile,
  hostname = "0.0.0.0",
  transport = "tcp"
}: ListenTLSOptions): Listener {
  const res = tlsOps.listenTLS({
    port,
    certFile,
    keyFile,
    hostname,
    transport
  });
  return new TLSListenerImpl(res.rid, res.localAddr);
}
