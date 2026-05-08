import {
  Client,
  Collection,
  GatewayIntentBits
} from 'discord.js';

import { Command } from './Command';
import { Button } from './Button';
import { SelectMenu } from './SelectMenu';
import { Modal } from './Modal';

export class OCSClient extends Client {
  commands = new Collection<string, Command>();

  buttons = new Collection<string, Button>();

  selectMenus = new Collection<
    string,
    SelectMenu
  >();

  modals = new Collection<string, Modal>();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
  }

  async start(token: string) {
    await this.login(token);
  }
}