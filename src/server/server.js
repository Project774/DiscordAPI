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

const permissions = {
    mod: [],
    admin: [],
    owner: []
};

const rolePermissions = {
    mod: GetConvar('DiscordAPI_MOD_ROLES', 'MODERATOR_ROLE_ID').split(','),
    admin: GetConvar('DiscordAPI_ADMIN_ROLES', 'ADMIN_ROLE_ID').split(','),
    owner: GetConvar('DiscordAPI_OWNER_ROLES', 'OWNER_ROLE_ID').split(',')
};

const userPermissions = {
    mod: GetConvar('DiscordAPI_MOD_USERS', '').split(',').filter(id => id.trim() !== ''),
    admin: GetConvar('DiscordAPI_ADMIN_USERS', '').split(',').filter(id => id.trim() !== ''),
    owner: GetConvar('DiscordAPI_OWNER_USERS', 'YOUR_DISCORD_USER_ID').split(',').filter(id => id.trim() !== '')
};

function hasPermission(userId, commandName) {
    const guild = client.guilds.cache.get(guildId);
    let member = null;
    
    if (guild) {
        member = guild.members.cache.get(userId);
    }

    if (userPermissions.mod && userPermissions.mod.includes(userId)) {
        if (permissions.mod && permissions.mod.includes(commandName)) {
            return true;
        }
    }
    
    if (userPermissions.admin && userPermissions.admin.includes(userId)) {
        if (permissions.admin && permissions.admin.includes(commandName)) {
            return true;
        }
        if (permissions.mod && permissions.mod.includes(commandName)) {
            return true;
        }
    }
    
    if (userPermissions.owner && userPermissions.owner.includes(userId)) {
        return true;
    }
    
    if (member && member.roles) {
        for (const [roleId, role] of member.roles.cache) {
            if (rolePermissions.mod && rolePermissions.mod.includes(roleId)) {
                if (permissions.mod && permissions.mod.includes(commandName)) {
                    return true;
                }
            }
            
            if (rolePermissions.admin && rolePermissions.admin.includes(roleId)) {
                if (permissions.admin && permissions.admin.includes(commandName)) {
                    return true;
                }
                if (permissions.mod && permissions.mod.includes(commandName)) {
                    return true;
                }
            }
            
            if (rolePermissions.owner && rolePermissions.owner.includes(roleId)) {
                return true;
            }
        }
    }
    
    return false;
}
exports('HasPermission', hasPermission);

// Permission check function
function getPermission(userId) {
    const guild = client.guilds.cache.get(guildId);
    let member = null;
    
    if (guild) {
        member = guild.members.cache.get(userId);
    }

    if (userPermissions.owner && userPermissions.owner.includes(userId)) {
        return 'owner';
    }
    if (userPermissions.admin && userPermissions.admin.includes(userId)) {
        return 'admin';
    }
    if (userPermissions.mod && userPermissions.mod.includes(userId)) {
        return 'mod';
    }
    
    if (member && member.roles) {
        for (const [roleId, role] of member.roles.cache) {
            if (rolePermissions.owner && rolePermissions.owner.includes(roleId)) {
                return 'owner';
            }
            if (rolePermissions.admin && rolePermissions.admin.includes(roleId)) {
                return 'admin';
            }
            if (rolePermissions.mod && rolePermissions.mod.includes(roleId)) {
                return 'mod';
            }
        }
    }
    return 'none';
}
exports('GetPermission', getPermission);

on('DiscordAPI:RegisterCommand', (name, description, options = [], perms) => {
    const command = {
        name: name,
        description: description,
        options: options.map(option => {
            let type = 3; // default to string
            if (option.type === 'string') type = 3;
            else if (option.type === 'integer') type = 4;
            else if (option.type === 'user') type = 6;
            else if (option.type === 'channel') type = 7;
            
            const mappedOption = {
                name: option.name,
                description: option.description,
                type: type,
                required: option.required || false
            };
            
            if (option.choices && Array.isArray(option.choices)) {
                mappedOption.choices = option.choices;
            }
            
            return mappedOption;
        })
    };

    if (perms) {
        if (perms === 'mod' && permissions.mod) {
            permissions.mod.push(name);
        } else if (perms === 'admin' && permissions.admin) {
            permissions.admin.push(name);
        } else if (perms === 'owner' && permissions.owner) {
            permissions.owner.push(name);
        }
        console.log(`[DiscordAPI] Added command /${name} to ${perms} permissions`);
    }

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
        const interactionData = {
            commandName: interaction.commandName,
            userId: interaction.user.id,
            username: interaction.user.username,
            channelId: interaction.channelId,
            guildId: interaction.guildId,
            interactionId: interaction.id,
            hasPermission: hasPermission(interaction.user.id, interaction.commandName),
            options: interaction.options.data.map(opt => ({
                name: opt.name,
                value: opt.value,
                type: opt.type
            }))
        };
        
        await interaction.deferReply();
        
        pendingInteractions.set(interaction.id, interaction);
        
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
        const app = await client.application.fetch();

        console.log(`[DiscordAPI] Started refreshing ${commandData.length} application (/) commands.`);
        await rest.put(
            Routes.applicationCommands(app.id),
            { body: commandData },
        );
        console.log(`[DiscordAPI] Successfully reloaded ${commandData.length} application (/) commands.`);

         
        RegisterCommand('refreshguild', async (src, args) => {
            if (src !== 0) return;

            const gId = args[0] || guildId;
            if (!gId) {
                console.log('Usage: /refreshguild [guildId]');
                return;
            }

            try {
                await rest.put(
                    Routes.applicationGuildCommands(app.id, gId),
                    { body: commandData },
                );
                console.log(`[DiscordAPI] Successfully refreshed commands for guild ${gId}`);
            } catch (err) {
                console.error(`[DiscordAPI] Failed to refresh commands for guild ${gId}: ${err.message}`);
            }
        }, true);
        
    } catch (error) {
        console.error(`[DiscordAPI] Failed to register commands: ${error.message}`);
    }
});

client.login(token).catch(error => {
    console.error('[DiscordAPI] Failed to login:', error);
});

console.log('[DiscordAPI] Discord bot system loaded (Lua-only mode)');
