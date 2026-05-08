import fs from 'fs';

import chokidar from 'chokidar';

import { prisma } from './DatabaseService';

import { logger } from './Logger';

import {
  updatePlayerPlaytime
} from './LeaderboardService';

const processedLines =
  new Set<string>();

export async function startPavlovLogWatchers() {
  const servers =
    await prisma.pavlovServer.findMany({
      where: {
        enabled: true
      }
    });

  for (const server of servers) {
    logger.info(
      `Watching Pavlov logs: ${server.name}`
    );

    const watcher = chokidar.watch(
      server.logPath,
      {
        ignoreInitial: false
      }
    );

    watcher.on(
      'change',
      async filePath => {
        await processLogFile(
          server.guildId,
          filePath
        );
      }
    );
  }
}

async function processLogFile(
  guildId: string,
  filePath: string
) {
  try {
    const content =
      fs.readFileSync(
        filePath,
        'utf8'
      );

    const lines =
      content.split('\n');

    for (const line of lines) {
      if (
        processedLines.has(line)
      )
        continue;

      processedLines.add(line);

      await parseLine(
        guildId,
        line
      );
    }
  } catch (error) {
    logger.error(
      `Failed to parse log file: ${filePath}`
    );
  }
}

async function parseLine(
  guildId: string,
  line: string
) {
  // Example patterns
  // You will adapt these later to REAL Pavlov logs

  if (
    line.includes('PlayerLogin')
  ) {
    const match =
      line.match(
        /PlayerLogin: (.+)/
      );

    if (!match) return;

    const player =
      match[1];

    logger.info(
      `Player joined: ${player}`
    );

    await updatePlayerPlaytime(
      guildId,
      player,
      5
    );
  }
}