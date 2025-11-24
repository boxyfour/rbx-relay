import { BaseInteraction, Client, Events, MessageFlags } from "discord.js";

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: BaseInteraction) {
  if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    console.log("autocompleting");
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
    return; // IMPORTANT
  }

  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No matching command ${interaction.commandName} was found`);
    return;
  }

  try {
    await command.execute(interaction);
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
