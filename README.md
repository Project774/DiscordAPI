# DiscordAPI

DiscordAPI for FiveM servers with an easy-to-use command registration system. (and more to come soon)

## Setup

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
# Discord Bot Configuration
set DiscordAPI_TOKEN "your_bot_token_here"
set DiscordAPI_CLIENT_ID "your_client_id_here"
set DiscordAPI_GUILD_ID "your_guild_id_here"
```

### 3. Install Dependencies

```bash
npm install
```

## Usage

### Basic Command Registration

The DiscordAPI system provides a simple way to register Discord slash commands from your FiveM server. Here's how to use it:

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

### Command Registration Parameters

```lua
DiscordAPI:RegisterCommand(name, description, options, callback)
```

- **name** (string): The command name (e.g., 'ping', 'kick')
- **description** (string): Command description shown in Discord
- **options** (table): Array of command options (optional)
- **callback** (function): Function called when command is executed

### Command Options

You can define options for your commands:

```lua
DiscordAPI:RegisterCommand('kick', 'Kick a player', {
    { name = 'player', description = 'Player name or ID', type = 'string', required = true },
    { name = 'reason', description = 'Reason for kick', type = 'string', required = false }
}, function(interactionData)
    -- Command logic here
end)
```

**Supported option types:**
- `string` - Text input
- `integer` - Number input  
- `user` - Discord user selection
- `channel` - Discord channel selection

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
    options = {                    -- Command options (if any)
        {
            name = "player",
            value = "JohnDoe",
            type = 3
        }
    }
}
```

### Multiple Users Support

The system automatically handles multiple users running commands simultaneously. Each interaction is tracked separately, so there are no conflicts between different users.

### Error Handling

The system includes built-in error handling for:
- Invalid interactions
- Missing responses
- Discord API errors

Errors are logged to the server console for debugging.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

---


## Credits

- Uses [discord.js](https://discord.js.org/) and FiveM natives