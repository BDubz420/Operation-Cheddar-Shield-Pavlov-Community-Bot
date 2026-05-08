import {
  Events,
  Interaction
} from 'discord.js';

import { OCSClient } from '../../structures/OCSClient';

import { EmbedService } from '../../services/EmbedService';

export default {
  name: Events.InteractionCreate,

  async execute(
    interaction: Interaction
  ) {
    const client =
      interaction.client as OCSClient;

    try {
      // COMMANDS

      if (
        interaction.isChatInputCommand()
      ) {
        const command =
          client.commands.get(
            interaction.commandName
          );

        if (!command) return;

        return await command.execute(
          interaction
        );
      }

      // BUTTONS

      if (interaction.isButton()) {
        let button =
          client.buttons.get(
            interaction.customId
          );

        // REGEX BUTTON SUPPORT

        if (!button) {
          button =
            [...client.buttons.values()]
              .find((btn: any) => {
                if (
                  btn.customId instanceof RegExp
                ) {
                  return btn.customId.test(
                    interaction.customId
                  );
                }

                return false;
              });
        }

        if (!button) return;

        return await button.execute(
          interaction
        );
      }

      // SELECT MENUS

      if (
        interaction.isStringSelectMenu()
      ) {
        const menu =
          client.selectMenus.get(
            interaction.customId
          );

        if (!menu) return;

        return await menu.execute(
          interaction
        );
      }

      // MODALS

      if (
        interaction.isModalSubmit()
      ) {
        const modal =
          client.modals.get(
            interaction.customId
          );

        if (!modal) return;

        return await modal.execute(
          interaction
        );
      }
    } catch (error: any) {
      console.error(
        'Interaction Error:',
        error
      );

      if (
        !interaction.isRepliable()
      ) {
        return;
      }

      const embed =
        EmbedService.error(
          'System Error',
          'An unexpected error occurred.'
        );

      try {
        if (
          interaction.deferred ||
          interaction.replied
        ) {
          await interaction.editReply({
            embeds: [embed]
          });
        } else {
          await interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
};