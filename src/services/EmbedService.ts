import {
  EmbedBuilder
} from 'discord.js';

import { COLORS } from '../utils/colors';

export class EmbedService {
  static success(
    title: string,
    description: string
  ) {
    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  static error(
    title: string,
    description: string
  ) {
    return new EmbedBuilder()
      .setColor(COLORS.DANGER)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  static warning(
    title: string,
    description: string
  ) {
    return new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle(`⚠️ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  static tactical(
    title: string,
    description: string
  ) {
    return new EmbedBuilder()
      .setColor(COLORS.GOLD)
      .setTitle(`🛡 ${title}`)
      .setDescription(description)
      .setFooter({
        text: 'Operation Cheddar Shield'
      })
      .setTimestamp();
  }
}