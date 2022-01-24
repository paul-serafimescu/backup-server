import * as discord from 'discord.js';
import * as config from './config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';

export const restHandle = new REST({ version: '9' }).setToken(config.BOT_TOKEN);

export const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('set up backup guild')
        .addStringOption(option => option.setName('guild_id')
                                         .setDescription('id of guild you wish to back up.')
                                         .setRequired(true)),
].map(command => command.toJSON());

export const intents = [
    discord.Intents.FLAGS.GUILDS,
    discord.Intents.FLAGS.GUILD_MEMBERS,
    discord.Intents.FLAGS.GUILD_MESSAGES,
    discord.Intents.FLAGS.GUILD_WEBHOOKS,
];

export async function registerCommands(client_id: string, guild_ids: string[]) {
    try {
        console.log('Started refreshing application (/) commands.');

        guild_ids.forEach(async guild_id => await restHandle.put(
            Routes.applicationGuildCommands(client_id, guild_id),
            { body: commands },
        ));

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};
