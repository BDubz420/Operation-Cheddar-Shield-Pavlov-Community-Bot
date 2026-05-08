import {
  StringSelectMenuInteraction
} from 'discord.js';

export abstract class SelectMenu {
  abstract customId: string;

  abstract execute(
    interaction: StringSelectMenuInteraction
  ): Promise<any>;
}