import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';
import { prisma } from '../../services/DatabaseService';
import { EmbedService } from '../../services/EmbedService';
import { createServerStatusBoard } from '../../services/ServerStatusService';

import {
  getRconClient,
  sendCommand
} from '../../services/PavlovRconManager';

export default class ServerCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Pavlov server management')

    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Register Pavlov server')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Server name')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('ip')
            .setDescription('Server IP')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('port')
            .setDescription('Game port')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('rconport')
            .setDescription('RCON port')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('password')
            .setDescription('RCON password')
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('statusboard')
        .setDescription('Deploy live server status board')
    )

    .addSubcommand(sub =>
      sub
        .setName('players')
        .setDescription('Test RCON player query')
    )

    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription('List registered servers')
    )

    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Remove server')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Server name')
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('test')
        .setDescription('Test RCON connection')
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
      case 'add':
        return await this.addServer(interaction);

      case 'statusboard':
        return await this.statusBoard(interaction);

      case 'players':
        return await this.players(interaction);

      case 'list':
        return await this.listServers(interaction);

      case 'remove':
        return await this.removeServer(interaction);

      case 'test':
        return await this.testServer(interaction);
    }
  }

  async addServer(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const name =
      interaction.options.getString('name', true);

    const serverIp =
      interaction.options.getString('ip', true);

    const serverPort =
      interaction.options.getInteger('port', true);

    const rconPort =
      interaction.options.getInteger('rconport', true);

    const rconPassword =
      interaction.options.getString('password', true);

    await prisma.pavlovServer.create({
      data: {
        guildId: interaction.guildId!,
        name,
        serverIp,
        serverPort,
        rconPort,
        rconPassword
      }
    });

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Server Registered',
          `${name} added successfully. Restart the bot to initialize its RCON socket.`
        )
      ]
    });
  }

  async statusBoard(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const channel = interaction.channel;

    if (!channel || !channel.isSendable()) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'Invalid Channel',
            'This channel cannot receive messages.'
          )
        ]
      });
    }

    await createServerStatusBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Server Status Board Created',
          'Persistent server status board deployed.'
        )
      ]
    });
  }

  async players(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const server =
      await prisma.pavlovServer.findFirst({
        where: {
          guildId: interaction.guildId!
        }
      });

    if (!server) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'No Server',
            'No Pavlov server registered.'
          )
        ]
      });
    }

    const rcon =
      getRconClient(server.id);

    if (!rcon) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'RCON Offline',
            'No active RCON connection. Restart the bot after adding or changing a server.'
          )
        ]
      });
    }

    try {
      sendCommand(
        server.id,
        'ServerInfo'
      );

      await interaction.editReply({
        embeds: [
          EmbedService.success(
            'UDP Packet Sent',
            'BattlEye UDP packet dispatched.'
          )
        ]
      });
    } catch (error) {
      console.error(error);

      await interaction.editReply({
        embeds: [
          EmbedService.error(
            'RCON Failed',
            'Failed to execute RCON command.'
          )
        ]
      });
    }
  }

  async listServers(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const servers =
      await prisma.pavlovServer.findMany({
        where: {
          guildId: interaction.guildId!
        }
      });

    await interaction.editReply({
      embeds: [
        EmbedService.tactical(
          'Registered Servers',
          servers.length
            ? servers
                .map(
                  server =>
                    `🟢 ${server.name}\n` +
                    `├ IP: ${server.serverIp}\n` +
                    `├ Game Port: ${server.serverPort}\n` +
                    `└ RCON Port: ${server.rconPort}`
                )
                .join('\n\n')
            : 'No servers registered.'
        )
      ]
    });
  }

  async removeServer(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const name =
      interaction.options.getString('name', true);

    const deleted =
      await prisma.pavlovServer.deleteMany({
        where: {
          guildId: interaction.guildId!,
          name
        }
      });

    if (deleted.count === 0) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'Server Not Found',
            `${name} was not found.`
          )
        ]
      });
    }

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Server Removed',
          `${name} removed successfully. Restart the bot to unload its RCON socket.`
        )
      ]
    });
  }

  async testServer(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const server =
      await prisma.pavlovServer.findFirst({
        where: {
          guildId: interaction.guildId!
        }
      });

    if (!server) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'No Server',
            'No registered server found.'
          )
        ]
      });
    }

    const rcon =
      getRconClient(server.id);

    if (!rcon) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'RCON Offline',
            'No active RCON client. Restart the bot after adding or changing a server.'
          )
        ]
      });
    }

    try {
      sendCommand(
        server.id,
        'ServerInfo'
      );

      await interaction.editReply({
        embeds: [
          EmbedService.success(
            'UDP Packet Sent',
            'BattlEye UDP packet dispatched.'
          )
        ]
      });
    } catch (error) {
      console.error(error);

      await interaction.editReply({
        embeds: [
          EmbedService.error(
            'RCON Failed',
            'Failed to send UDP packet.'
          )
        ]
      });
    }
  }
}