import {
  ChatInputCommandInteraction
} from 'discord.js';

export abstract class Command {
  abstract data: any;

  abstract execute(
    interaction: ChatInputCommandInteraction
  ): Promise<any>;
}