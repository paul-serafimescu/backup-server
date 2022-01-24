import * as discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import * as config from './config';
import * as api from './api';

export interface IMappings {
    guilds: Record<string, string>;
    channels: Record<string, string>;
}

export const setupPath = path.join(process.cwd(), 'setup.json');

export class Client extends discord.Client {
    private mappings: IMappings = { guilds: {}, channels: {} };

    constructor(options: discord.ClientOptions) {
        super(options);
    }

    public getMappings = () => this.mappings;

    public setMappings = (newMappings: IMappings) => this.mappings = newMappings;

    public addChannelMap = (to: string, from: string) => { this.mappings.channels[from] = to };

    public addGuildMap = (to: string, from: string) => { this.mappings.guilds[from] = to };

    public dump = () => fs.writeFileSync(setupPath, JSON.stringify(this.mappings));

    public isDest = (id: string) => [...Object.values(this.mappings.guilds), ...Object.values(this.mappings.channels)].includes(id);

    public isSource = (id: string) => [...Object.keys(this.mappings.guilds), ...Object.keys(this.mappings.channels)].includes(id);
}

const bot = new Client({ intents: api.intents });

bot.once('ready', async () => {
    if (fs.existsSync(setupPath)) {
        bot.setMappings(JSON.parse(fs.readFileSync(setupPath).toString()))
    }

    await api.registerCommands(config.CLIENT_ID, bot.guilds.cache.map(guild => guild.id));
    console.log('ready...');
});

bot.on('guildCreate', async guild => {
    return await api.registerCommands(config.CLIENT_ID, [guild.id]);
});

bot.on('interactionCreate', async interaction => {
    if (interaction.user.id !== '882055585791623198') {
        return;
    }
    if (interaction.isCommand()) {
        const originalGuild = interaction.guild;
        const response = { content: 'invalid command: ' };

        if (!originalGuild || bot.isDest(originalGuild.id)) {
            response.content += 'bot error';
            return await interaction.reply(response);
        }

        switch (interaction.commandName) {
            case 'setup':
                const to = interaction.options.getString('guild_id');
                if (to) {
                    const guild = bot.guilds.cache.get(to);
                    if (!guild) {
                        response.content += `guild with id \`${to}\` not found`;
                    } else {
                        interaction.reply('all done!');
                        bot.addGuildMap(guild.id, originalGuild.id);
                        for (const [_, oldChannel] of originalGuild.channels.cache.filter(channel => channel.isText())) {
                            const newChannel = await guild.channels.create(oldChannel.name, {
                                reason: `${bot.user?.username} setup`,
                            });
                            bot.addChannelMap(newChannel.id, oldChannel.id);
                        }
                        return;
                    }
                } else {
                    response.content += 'missing parameter `guild_id`';
                } break;
            default: 
                response.content += 'unknown command';
        }
        return await interaction.reply(response);
    }
});

bot.on('messageCreate', async message => {
    const channel_id = message.channel.id;

    if (!bot.isDest(channel_id) && bot.isSource(channel_id)) {
        const mappings = bot.getMappings();
        const destChannel = bot.channels.cache.get(mappings.channels[channel_id]) as discord.TextChannel;
        try {
            const webhook = await destChannel.createWebhook(message.author.username, {
                avatar: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
                reason: 'creating webhook'
            });
            await webhook.send({
                content: message.content ? message.content : undefined,
                attachments: message.attachments.size > 0 ? [...message.attachments.values()] : undefined,
                embeds: message.embeds.length > 0 ? message.embeds : undefined,
            });
            await webhook.delete('cleaning up');
        } catch (error) {
            console.error(error);
        }
    }
});

bot.on('rateLimit', (info: discord.RateLimitData) => {
    console.log(info);
});

async function handleClose() {
    bot.dump();
    process.exit();
}

process.on('SIGINT', handleClose);

export default bot;
