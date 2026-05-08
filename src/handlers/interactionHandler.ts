import fs from 'fs';
import path from 'path';

import { OCSClient } from '../structures/OCSClient';

export async function loadInteractions(
  client: OCSClient
) {
  // BUTTONS

  const buttonsPath = path.join(
    __dirname,
    '../interactions/buttons'
  );

  if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs
      .readdirSync(buttonsPath)
      .filter(file => file.endsWith('.ts'));

    for (const file of buttonFiles) {
      const imported = await import(
        path.join(buttonsPath, file)
      );

      const button =
        imported.default;

      client.buttons.set(
        button.customId,
        button
      );

      console.log(
        `Loaded button: ${button.customId}`
      );
    }
  }

  // SELECT MENUS

  const menusPath = path.join(
    __dirname,
    '../interactions/selectMenus'
  );

  if (fs.existsSync(menusPath)) {
    const menuFiles = fs
      .readdirSync(menusPath)
      .filter(file => file.endsWith('.ts'));

    for (const file of menuFiles) {
      const imported = await import(
        path.join(menusPath, file)
      );

      const menu =
        imported.default;

      client.selectMenus.set(
        menu.customId,
        menu
      );

      console.log(
        `Loaded select menu: ${menu.customId}`
      );
    }
  }

  // MODALS

  const modalsPath = path.join(
    __dirname,
    '../interactions/modals'
  );

  if (fs.existsSync(modalsPath)) {
    const modalFiles = fs
      .readdirSync(modalsPath)
      .filter(file => file.endsWith('.ts'));

    for (const file of modalFiles) {
      const imported = await import(
        path.join(modalsPath, file)
      );

      const modal =
        imported.default;

      client.modals.set(
        modal.customId,
        modal
      );

      console.log(
        `Loaded modal: ${modal.customId}`
      );
    }
  }
}