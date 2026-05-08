import fs from 'fs';
import path from 'path';

import { OCSClient } from '../structures/OCSClient';
import { Command } from '../structures/Command';

export async function loadCommands(
  client: OCSClient
) {
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

      const command: Command =
        new imported.default();

      client.commands.set(
        command.data.name,
        command
      );

      console.log(
        `Loaded command: ${command.data.name}`
      );
    }
  }
}