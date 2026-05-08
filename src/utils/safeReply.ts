import {
  InteractionReplyOptions,
  MessagePayload,
  RepliableInteraction
} from 'discord.js';

type ReplyContent =
  | string
  | MessagePayload
  | InteractionReplyOptions;

export async function safeReply(
  interaction: RepliableInteraction,
  options: ReplyContent
) {
  try {
    if (interaction.replied || interaction.deferred) {
      return await interaction.followUp(options as InteractionReplyOptions);
    }

    return await interaction.reply(options as InteractionReplyOptions);
  } catch (error) {
    console.error('safeReply failed:', error);
  }
}

export async function safeEditReply(
  interaction: RepliableInteraction,
  options: string | MessagePayload | InteractionReplyOptions
) {
  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }

    return await interaction.editReply(options as any);
  } catch (error) {
    console.error('safeEditReply failed:', error);
  }
}

export async function safeDefer(
  interaction: RepliableInteraction,
  ephemeral = false
) {
  try {
    if (!interaction.deferred && !interaction.replied) {
      return await interaction.deferReply({
        flags: ephemeral ? ['Ephemeral'] : undefined
      });
    }
  } catch (error) {
    console.error('safeDefer failed:', error);
  }
}