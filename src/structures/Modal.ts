import {
  ModalSubmitInteraction
} from 'discord.js';

export abstract class Modal {
  abstract customId: string;

  abstract execute(
    interaction: ModalSubmitInteraction
  ): Promise<any>;
}