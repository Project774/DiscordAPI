const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = GetConvar('DiscordAPI_TOKEN', '');
const clientId = GetConvar('DiscordAPI_CLIENT_ID', '');
const guildId = GetConvar('DiscordAPI_GUILD_ID', '');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

const commandData = [];
const luaCommands = new Collection();
const pendingInteractions = new Map();

on('DiscordAPI:RegisterCommand', (name, description, options = []) => {
    const command = {
        name: name,
        description: description,
        options: options.map(option => {
            let type = 3; // default to string
            if (option.type === 'string') type = 3;
            else if (option.type === 'integer') type = 4;
            else if (option.type === 'user') type = 6;
            else if (option.type === 'channel') type = 7;
            return {
                name: option.name,
                description: option.description,
                type: type,
                required: option.required || false
            };
        })
    };
    commandData.push(command);
    luaCommands.set(name, command);
    console.log(`[DiscordAPI] Registered Lua command: /${name}`);
});

// on('DiscordAPI:SendResponse', (channelId, response) => {
//     const interaction = global.currentInteraction;
//     if (interaction) {
//         interaction.editReply(response).catch(error => {
//             console.error('[DiscordAPI] Error sending response:', error);
//         });
//     }
// });

on('DiscordAPI:SendResponse', (interactionId, response) => {
    const interaction = pendingInteractions.get(interactionId);
    if (interaction) {
        interaction.editReply(response).then(() => {
            emit('DiscordAPI:MessageSent:' + interactionId);
        }).catch(error => {
            console.error('[DiscordAPI] Error sending response:', error);
        });
    } else {
        console.error('[DiscordAPI] No interaction available for response');
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const luaCommand = luaCommands.get(interaction.commandName);

    if (!luaCommand) return;

    try {
        // This is a Lua command, trigger the Lua event
        const interactionData = {
            // interaction: interaction,
            commandName: interaction.commandName,
            userId: interaction.user.id,
            username: interaction.user.username,
            channelId: interaction.channelId,
            guildId: interaction.guildId,
            interactionId: interaction.id,
            options: interaction.options.data.map(opt => ({
                name: opt.name,
                value: opt.value,
                type: opt.type
            }))
        };
        
        // Defer the reply first so we can edit it later
        await interaction.deferReply();
        
        // Store interaction by ID for this command execution
        pendingInteractions.set(interaction.id, interaction);
        
        // Trigger a Lua event that can be handled
        emit('DiscordAPI:CommandExecuted', interactionData);
    } catch (error) {
        console.error(`[DiscordAPI] Error executing command ${interaction.commandName}:`, error);
        
        const errorEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('❌ Error')
            .setDescription('An error occurred while executing this command.')
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

client.once('ready', async () => {
    console.log(`[DiscordAPI] Bot logged in as ${client.user.tag}`);
    
    const rest = new REST({ version: '9' }).setToken(token);
    
    try {
        console.log('[DiscordAPI] Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commandData }
        );
        
        console.log('[DiscordAPI] Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('[DiscordAPI] Error registering commands:', error);
    }
});

client.login(token).catch(error => {
    console.error('[DiscordAPI] Failed to login:', error);
});

console.log('[DiscordAPI] Discord bot system loaded (Lua-only mode)');
