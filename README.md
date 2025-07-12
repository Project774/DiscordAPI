# DiscordAPI

A powerful Discord bot integration for FiveM servers with an easy-to-use command registration system, built-in permission management, and rich Discord interactions.

## ✨ Features

- **Easy Command Registration**: Simple Lua API for creating Discord slash commands
- **Built-in Permission System**: Role and user-based permissions with inheritance
- **Rich Embeds**: Beautiful, customizable Discord embeds
- **Dropdown Support**: Choice-based options for better UX
- **Multiple User Support**: Handle multiple simultaneous interactions
- **Built-in Commands**: Ready-to-use commands for server management
- **Callback System**: Update messages and send multiple responses
- **Error Handling**: Robust error handling and logging

## 🚀 Setup

### 1. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token
5. Go to "OAuth2" > "URL Generator"
6. Select "bot" and "applications.commands" scopes
7. Select the permissions you need
8. Use the generated URL to invite the bot to your server

### 2. FiveM Configuration

Add these convars to your `server.cfg`:

```cfg
# Resource Permissions (required for built-in commands)
add_ace resource.DiscordAPI command allow
add_ace resource.DiscordAPI command.refresh allow
add_ace resource.DiscordAPI command.ensure allow
add_ace resource.DiscordAPI command.start allow
add_ace resource.DiscordAPI command.stop allow
add_ace resource.DiscordAPI command.restart allow

# Discord Bot Configuration
set DiscordAPI_TOKEN "your_bot_token_here"
set DiscordAPI_CLIENT_ID "your_client_id_here"
set DiscordAPI_GUILD_ID "your_guild_id_here"

# Discord Role IDs (multiple roles per level)
set DiscordAPI_MOD_ROLES "1234567890123456789,9876543210987654321"
set DiscordAPI_ADMIN_ROLES "1111111111111111111,2222222222222222222"
set DiscordAPI_OWNER_ROLES "3333333333333333333,4444444444444444444"

# Discord User IDs (multiple users per level)
set DiscordAPI_MOD_USERS "5555555555555555555,6666666666666666666"
set DiscordAPI_ADMIN_USERS "7777777777777777777,8888888888888888888"
set DiscordAPI_OWNER_USERS "9999999999999999999,0000000000000000000"
```

### 3. Install Dependencies

```bash
npm install
```

## 📋 Built-in Commands

The system comes with several ready-to-use commands:

### `/ping` - Bot Responsiveness Check
- **Permission**: None required
- **Description**: Check bot latency and responsiveness
- **Features**: Real-time latency calculation with callback updates

### `/players` - Server Player List
- **Permission**: Mod+
- **Description**: Shows online players and server status
- **Features**: Player count, player list, server info

### `/kick` - Kick Player
- **Permission**: Mod+
- **Description**: Kick a player from the server
- **Options**: Player selection, reason (optional)

### `/status` - Server Status
- **Permission**: Mod+
- **Description**: Detailed server status information
- **Features**: Player count, uptime, server info

### `/resources` - Resource Management
- **Permission**: Admin+
- **Description**: Manage server resources
- **Options**: 
  - Action dropdown (Ensure, Refresh, Start, Stop, Restart)
  - Resource name (optional for refresh)
- **Features**: Dropdown menu, resource validation

### `/refresh` - Refresh Discord Commands
- **Permission**: Owner
- **Description**: Refresh Discord slash commands for the guild
- **Options**: Guild ID (optional)
- **Features**: Console integration, guild-specific refresh

## 🔧 Usage

### Basic Command Registration

```lua
-- Server Side Examples
local DiscordAPI = exports['DiscordAPI']

DiscordAPI:RegisterCommand('fivem', 'Show FiveM server info', {}, function(interactionData)
    local embed = {
        color = 0x00ff00,
        title = "🎮 FiveM Server",
        description = "Welcome to our FiveM server!",
        fields = {
            {
                name = "Server Name",
                value = GetConvar('sv_hostname', 'FiveM Server'),
                inline = true
            },
            {
                name = "Players Online",
                value = string.format("%d/%d", #GetPlayers(), GetConvarInt('sv_maxclients', 32)),
                inline = true
            },
            {
                name = "Server Version",
                value = GetConvar('version', 'Unknown'),
                inline = true
            }
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }
    
    DiscordAPI:SendResponse(interactionData.interactionId, { embeds = { embed } })
end)
```

### Command Registration with Permissions

```lua
DiscordAPI:RegisterCommand(name, description, options, callback, permission)
```

- **name** (string): The command name (e.g., 'ping', 'kick')
- **description** (string): Command description shown in Discord
- **options** (table): Array of command options (optional)
- **callback** (function): Function called when command is executed
- **permission** (string): The permission level needed ('mod', 'admin', 'owner')

### Permission Levels

The system uses a hierarchical permission system:

- **Mod**: Can use mod commands
- **Admin**: Can use admin commands + all mod commands
- **Owner**: Can use all commands (mod + admin + owner)

### Command Options with Dropdowns

```lua
DiscordAPI:RegisterCommand('kick', 'Kick a player', {
    { name = 'player', description = 'Player name or ID', type = 'string', required = true },
    { name = 'reason', description = 'Reason for kick', type = 'string', required = false }
}, function(interactionData)
    -- Command logic here
end, 'mod')

-- Example with dropdown choices
DiscordAPI:RegisterCommand('resources', 'Manage server resources', {
    { name = 'action', description = 'Action to perform', type = 'string', required = true, choices = {
        { name = 'Ensure', value = 'ensure' },
        { name = 'Refresh', value = 'refresh' },
        { name = 'Start', value = 'start' },
        { name = 'Stop', value = 'stop' },
        { name = 'Restart', value = 'restart' }
    }},
    { name = 'resource', description = 'Name of the resource', type = 'string', required = false }
}, function(interactionData)
    -- Command logic here
end, 'admin')
```

**Supported option types:**
- `string` - Text input
- `integer` - Number input  
- `user` - Discord user selection
- `channel` - Discord channel selection

**Dropdown choices format:**
```lua
choices = {
    { name = 'Display Name', value = 'actual_value' },
    { name = 'Another Option', value = 'another_value' }
}
```

### Sending Responses

Use `DiscordAPI:SendResponse()` to send messages back to Discord:

```lua
DiscordAPI:SendResponse(interactionData.interactionId, response)
```

**Response format:**
```lua
{
    content = "Simple text message",  -- Optional
    embeds = { embedObject },        -- Optional
    ephemeral = true                 -- Optional - only visible to command user
}
```

### Embed Format

Create rich embeds for better-looking responses:

```lua
local embed = {
    color = 0x00ff00,                    -- Hex color
    title = "Title",                     -- Embed title
    description = "Description",         -- Embed description
    fields = {                           -- Array of fields
        {
            name = "Field Name",
            value = "Field Value",
            inline = true                -- Optional - display inline
        }
    },
    footer = {                           -- Optional footer
        text = "Footer text"
    },
    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")  -- Optional timestamp
}
```

### Using Callbacks

You can use callbacks to send multiple responses or update messages:

```lua
DiscordAPI:RegisterCommand('ping', 'Check bot responsiveness', {}, function(interactionData)
    local startTime = GetGameTimer()
    
    local embed = {
        color = 0x00ff00,
        title = "🏓 Pong!",
        description = "Pinging...",
        fields = {
            {
                name = "Latency",
                value = "Calculating...",
                inline = true
            }
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }
    
    -- Send initial response with callback
    DiscordAPI:SendResponse(interactionData.interactionId, { embeds = { embed } }, function()
        local endTime = GetGameTimer()
        local latency = endTime - startTime

        local finalEmbed = {
            color = 0x00ff00,
            title = "📝 Example",
            description = "This is an example of how to use callbacks!",
            fields = {
                {
                    name = "Latency",
                    value = string.format("**%dms**", latency),
                    inline = true
                },
                {
                    name = "Message",
                    value = "The original message was updated after 5 seconds",
                    inline = true
                },
                {
                    name = "Callback",
                    value = "This shows callback functionality",
                    inline = true
                }
            },
            timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
        }
        
        -- Send updated response
        DiscordAPI:SendResponse(interactionData.interactionId, { embeds = { finalEmbed } })
    end)
end)
```

### Interaction Data

The `interactionData` parameter contains information about the Discord interaction:

```lua
{
    commandName = "ping",           -- Name of the executed command
    userId = "123456789",          -- Discord user ID
    username = "username",         -- Discord username
    channelId = "123456789",       -- Discord channel ID
    guildId = "123456789",         -- Discord server ID
    interactionId = "123456789",   -- Unique interaction ID
    hasPermission = true,          -- Whether user has permission
    options = {                    -- Command options (if any)
        {
            name = "player",
            value = "JohnDoe",
            type = 3
        }
    }
}
```

### Permission Checking

You can check permissions in your commands:

```lua
DiscordAPI:RegisterCommand('admin', 'Admin only command', {}, function(interactionData)
    if not interactionData.hasPermission then
        DiscordAPI:SendResponse(interactionData.interactionId, { 
            content = "❌ You don't have permission to use this command!", 
            ephemeral = true 
        })
        return
    end
    
    -- Command logic here
end, 'admin')
```

### JavaScript Permission Functions

The system also exports JavaScript functions for permission checking:

```javascript
// Check if user can use specific command
const canUse = exports['DiscordAPI']:HasPermission(userId, 'commandName')

// Get user's permission level
const userLevel = exports['DiscordAPI']:GetPermission(userId)
// Returns: 'owner', 'admin', 'mod', or 'none'
```

## 🔄 Console Commands

The system provides console commands for server management:

### `refreshguild [guildId]`
Refreshes Discord slash commands for a specific guild or the default guild.

## 🛠️ Advanced Features

### Multiple Users Support

The system automatically handles multiple users running commands simultaneously. Each interaction is tracked separately, so there are no conflicts between different users.

### Error Handling

The system includes built-in error handling for:
- Invalid interactions
- Missing responses
- Discord API errors
- Permission validation
- Resource management safety

Errors are logged to the server console for debugging.

### Resource Safety

Built-in commands include safety features:
- Prevents restarting the DiscordAPI resource itself
- Validates resource names before execution
- Proper error handling for failed operations

## 📁 File Structure

```
DiscordAPI/
├── fxmanifest.lua
├── package.json
├── README.md
├── src/
│   ├── client/
│   └── server/
│       ├── commands.lua          # Core command system
│       ├── server.js             # Discord.js bot
│       └── commands/
│           ├── ping.lua          # Built-in ping command
│           ├── players.lua       # Built-in players command
│           ├── kick.lua          # Built-in kick command
│           ├── status.lua        # Built-in status command
│           ├── resources.lua     # Built-in resource management
│           └── refresh.lua       # Built-in refresh command
```

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

## 🙏 Credits

- Uses [discord.js](https://discord.js.org/) for Discord integration
- Built for FiveM server management
- Inspired by modern Discord bot development practices