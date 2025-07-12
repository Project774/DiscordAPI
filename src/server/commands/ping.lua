_RegisterCommand('ping', 'Check if the bot is responsive', {}, function(interactionData)
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
            },
            {
                name = "Status",
                value = "🟢 Online",
                inline = true
            }
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }
    
    SendResponse(interactionData.interactionId, { embeds = { embed } }, function()
        local endTime = GetGameTimer()
        local latency = endTime - startTime

        local finalEmbed = {
            color = 0x00ff00,
            title = "🏓 Pong!",
            description = string.format("Latency is **%dms**", latency),
            fields = {
                {
                    name = "Latency",
                    value = string.format("**%dms**", latency),
                    inline = true
                },
                {
                    name = "Status",
                    value = "🟢 Online",
                    inline = true
                }
            },
            timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
        }
        
        SendResponse(interactionData.interactionId, { embeds = { finalEmbed } })
    end)
end)