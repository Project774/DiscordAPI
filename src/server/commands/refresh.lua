_RegisterCommand('refresh', 'Refresh commands for guild', {
    { name = 'guild', description = 'Guild ID', type = 'string', required = false },
}, function(interactionData)
    if not interactionData.hasPermission then
        SendResponse(interactionData.interactionId, { 
            content = "❌ You don't have permission to use this command!", 
            ephemeral = true 
        })
        return
    end
    
    local guild = nil

    for _, option in ipairs(interactionData.options) do
        if option.name == 'guild' then
            guild = option.value
        end
    end

    ExecuteCommand(('refreshguild %s'):format(guild or interactionData.guildId))

    local embed = {
        color = 0x00ff00,
        title = "🔄 Command Refresh",
        description = "Successfully refreshed Discord commands!",
        fields = {
            {
                name = "📋 Details",
                value = string.format("**Guild ID:** %s\n**Commands:** Refreshed\n**Status:** ✅ Complete", guild or interactionData.guildId),
                inline = false
            }
        },
        footer = {
            text = "Discord Commands Refreshed"
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }

    SendResponse(interactionData.interactionId, { embeds = { embed } })
end, 'owner')