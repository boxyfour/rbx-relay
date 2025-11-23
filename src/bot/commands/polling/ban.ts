import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("replies with pong")
  .addStringOption((option) =>
    option
      .setName("target")
      .setDescription("The member's username or user ID.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("The reason for banning")
  )
  .addBooleanOption((option) =>
    option.setName("indefinite").setDescription("Should the ban be permanent")
  )
  .addStringOption((option) =>
    option
      .setName("units")
      .setDescription(
        "The amount of time in x units the player should be banned"
      )
  )
  .addStringOption((option) =>
    option
      .setName("unit")
      .setDescription(
        "The amount of time in x units the player should be banned"
      )
      .setAutocomplete(true)
  );

export async function execute(interaction: CommandInteraction) {
  interaction.reply("Pong!");
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused();
  const choices = ["months", "hours", "weeks", "years", "days"];
  const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
  await interaction.respond(
    filtered.map((choice) => ({ name: choice, value: choice }))
  );
}
