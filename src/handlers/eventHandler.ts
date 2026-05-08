import fs from 'fs';
import path from 'path';

import { OCSClient } from '../structures/OCSClient';

async function loadEventFiles(
  client: OCSClient,
  dir: string
) {
  const entries =
    fs.readdirSync(dir, {
      withFileTypes: true
    });

  for (const entry of entries) {
    const fullPath = path.join(
      dir,
      entry.name
    );

    if (entry.isDirectory()) {
      await loadEventFiles(
        client,
        fullPath
      );

      continue;
    }

    if (!entry.name.endsWith('.ts'))
      continue;

    const event =
      await import(fullPath);

    if (event.default.once) {
      client.once(
        event.default.name,
        (...args) =>
          event.default.execute(...args)
      );
    } else {
      client.on(
        event.default.name,
        (...args) =>
          event.default.execute(...args)
      );
    }

    console.log(
      `Loaded event: ${entry.name}`
    );
  }
}

export async function loadEvents(
  client: OCSClient
) {
  const eventsPath = path.join(
    __dirname,
    '../events'
  );

  await loadEventFiles(
    client,
    eventsPath
  );
}