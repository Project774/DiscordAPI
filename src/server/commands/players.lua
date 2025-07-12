_RegisterCommand('players', 'Show online players', {}, function(interactionData)
    local players = GetPlayers()
    local playerCount = #players
    local playerList = {}
    
    for i = 1, playerCount do
        local playerName = GetPlayerName(players[i])
        table.insert(playerList, playerName)
    end
    
    local embed = {
        color = 0x00ff00,
        title = "👥 Online Players",
        description = string.format("**%d** players online", playerCount),
        fields = {
            {
                name = "Player List",
                value = playerCount > 0 and table.concat(playerList, "\n") or "No players online",
                inline = false
            }
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }

    SendResponse(interactionData.interactionId, { embeds = { embed } })
end)