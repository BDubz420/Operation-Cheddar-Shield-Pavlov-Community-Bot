import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import {
  lockdownGuild,
  unlockGuild
} from '../../services/LockdownService';

export default class LockdownCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('lockdown')

    .setDescription(
      'Emergency lockdown systems'
    )

    .addSubcommand(sub =>
      sub
        .setName('enable')
        .setDescription(
          'Enable emergency lockdown'
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('disable')
        .setDescription(
          'Disable emergency lockdown'
        )
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const subcommand =
      interaction.options.getSubcommand();

    switch (subcommand) {
      case 'enable':
        return await this.enable(
          interaction
        );

      case 'disable':
        return await this.disable(
          interaction
        );
    }
  }

  async enable(
    interaction: ChatInputCommandInteraction
  ) {

    await interaction.deferReply();
    
    const embed =
      await lockdownGuild(
        interaction.guild!,
        interaction.user.tag
      );

    await interaction.editReply({
      embeds: [embed]
    });
  }

	async disable(
	  interaction: ChatInputCommandInteraction
	) {
	  await interaction.deferReply();

	  const embed =
	    await unlockGuild(
	      interaction.guild!,
	      interaction.user.tag
	    );

	  await interaction.editReply({
	    embeds: [embed]
	  });
	}
}