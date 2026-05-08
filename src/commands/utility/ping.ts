import {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';

export default class PingCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription(
      'Check O.C.S bot latency'
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.reply({
      embeds: [
        EmbedService.tactical(
          'O.C.S Network Status',
          `Current latency: ${interaction.client.ws.ping}ms`
        )
      ]
    });
  }
}