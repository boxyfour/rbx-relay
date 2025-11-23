import { BaseInteraction, Client, Events, MessageFlags } from "discord.js";

export const name = Events.InteractionCreate;
export const once = true;
export async function execute(interaction: BaseInteraction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No matching command ${interaction.commandName} was found`);
    return;
  }

  try {
    if (interaction.isAutocomplete()) {
      console.log("autocompleting");

      await command.autocomplete(interaction);
      return;
    }
    await command.execute();
  } catch (error) {
    console.error(error);

    if (!interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
