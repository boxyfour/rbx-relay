import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { data_manager } from "../../../api/store";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("replies with pong")
  .addStringOption((option) =>
    option.setName("target_id").setDescription("The member's user ID.")
  )
  .addStringOption((option) =>
    option
      .setName("target_username")
      .setDescription("The member's username (not display name).")
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("The reason for kicking")
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getString("target_id"); // required
  const target_name = interaction.options.getString("target_username"); // required
  const reason = interaction.options.getString("reason"); // optional

  if (!target && !target_name) {
    return interaction.reply({
      content: "who are you banning? (missing userid or username",
      flags: MessageFlags.Ephemeral,
    });
  }

  await data_manager.add_global_action({
    topic: "kick",
    arguments: [target, target_name, reason],
  });

  return interaction.reply({
    content: "sent message to database..",
    flags: MessageFlags.Ephemeral,
  });
}
