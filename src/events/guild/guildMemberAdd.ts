import {
  Events,
  GuildMember
} from 'discord.js';

import { handleMemberJoin } from '../../services/AntiRaidService';

export default {
  name: Events.GuildMemberAdd,

  async execute(member: GuildMember) {
    await handleMemberJoin(member);
  }
};