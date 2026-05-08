import {
  ButtonInteraction
} from 'discord.js';

export abstract class Button {
  abstract customId: string;

  abstract execute(
    interaction: ButtonInteraction
  ): Promise<void>;
}