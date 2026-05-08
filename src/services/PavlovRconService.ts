import { Rcon } from 'rcon-client';

export class PavlovRconService {
  private rcon: Rcon;

  constructor() {
    this.rcon = new Rcon({
      host: process.env.RCON_HOST!,
      port: Number(process.env.RCON_PORT),
      password: process.env.RCON_PASSWORD!
    });
  }

  async connect() {
    await this.rcon.connect();

    console.log('RCON connected');
  }

  async send(command: string) {
    return await this.rcon.send(command);
  }
}