import dgram from 'dgram';

import { prisma } from './DatabaseService';
import { logger } from './Logger';

type RconClient = {
  socket: dgram.Socket;

  host: string;

  port: number;

  password: string;

  authenticated: boolean;
};

type ServerTelemetry = {
  online: boolean;

  lastResponse: number;

  raw?: string;
};

const telemetry =
  new Map<string, ServerTelemetry>();

const clients =
  new Map<string, RconClient>();

const BE_HEADER =
  Buffer.from('BE', 'ascii');

function buildLoginPacket(
  password: string
) {
  const payload =
    Buffer.from(password);

  return Buffer.concat([
    BE_HEADER,

    Buffer.from([0xff, 0x00]),

    payload
  ]);
}

function buildCommandPacket(
  command: string
) {
  const payload =
    Buffer.from(command);

  return Buffer.concat([
    BE_HEADER,

    Buffer.from([0xff, 0x01]),

    payload
  ]);
}

export async function initializeRconConnections() {
  const servers =
    await prisma.pavlovServer.findMany({
      where: {
        enabled: true
      }
    });

  for (const server of servers) {
    try {
      const socket =
        dgram.createSocket('udp4');

      const client: RconClient = {
        socket,

        host: server.serverIp,

        port: server.rconPort,

        password:
          server.rconPassword,

        authenticated: false
      };

      socket.on('message', msg => {
        try {
          const raw =
            msg.toString();

          logger.info(
            `[${server.name}] ${raw}`
          );

          telemetry.set(server.id, {
            online: true,

            lastResponse: Date.now(),

            raw
          });

        } catch (error) {
          console.error(error);
        }
      });

      socket.on(
        'error',
        err => {
          logger.error(
            `[${server.name}] UDP Error`
          );

          console.error(err);
        }
      );

      clients.set(
        server.id,
        client
      );

      logger.info(
        `BattlEye UDP ready: ${server.name}`
      );

      authenticate(server.id);
    } catch (error) {
      logger.error(
        `Failed UDP init: ${server.name}`
      );

      console.error(error);
    }
  }
}

export function getRconClient(
  serverId: string
) {
  return clients.get(serverId);
}

export function authenticate(
  serverId: string
) {
  const client =
    clients.get(serverId);

  if (!client) return;

  const packet =
    buildLoginPacket(
      client.password
    );

  client.socket.send(
    packet,
    client.port,
    client.host
  );

  logger.info(
    `Sent BattlEye auth packet`
  );
}

export function sendCommand(
  serverId: string,
  command: string
) {
  const client =
    clients.get(serverId);

  if (!client) return;

  const packet =
    buildCommandPacket(command);

  client.socket.send(
    packet,
    client.port,
    client.host
  );

  logger.info(
    `Sent command: ${command}`
  );
}

export function getTelemetry(
  serverId: string
) {
  return telemetry.get(serverId);
}