import 'dotenv/config';

import fs from 'fs';
import path from 'path';

import {
  REST,
  Routes
} from 'discord.js';

async function deploy() {
  const commands = [];

  const commandsPath = path.join(
    __dirname,
    '../commands'
  );

  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const files = fs
      .readdirSync(
        path.join(commandsPath, folder)
      )
      .filter(file => file.endsWith('.ts'));

    for (const file of files) {
      const filePath = path.join(
        commandsPath,
        folder,
        file
      );

      const imported = await import(filePath);

      const command = new imported.default();

      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({
    version: '10'
  }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log(
      `Deploying ${commands.length} commands...`
    );

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
      ),
      {
        body: commands
      }
    );

    console.log(
      'Successfully deployed commands.'
    );
  } catch (error) {
    console.error(error);
  }
}

deploy();