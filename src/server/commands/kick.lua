
_RegisterCommand('kick', 'Kick a player from the server', {
    { name = 'player', description = 'Player name or ID', type = 'string', required = true },
    { name = 'reason', description = 'Reason for kick', type = 'string', required = false }
}, function(interactionData)
    if not interactionData.hasPermission then
        SendResponse(interactionData.interactionId, { 
            content = "❌ You don't have permission to use this command!", 
            ephemeral = true 
        })
        return
    end

    local player = nil
    local reason = 'No reason provided'

    for _, option in ipairs(interactionData.options) do
        if option.name == 'player' then
            player = option.value
        elseif option.name == 'reason' then
            reason = option.value
        end
    end

    if player then
        local players = GetPlayers()
        local targetPlayer = nil
        
        for i = 1, #players do
            if GetPlayerName(players[i]) == player or tostring(players[i]) == player then
                targetPlayer = players[i]
                break
            end
        end
        
        if targetPlayer then
            DropPlayer(targetPlayer, reason)
            SendResponse(interactionData.interactionId, { content = string.format("✅ Kicked %s for: %s", player, reason) })
        else
            SendResponse(interactionData.interactionId, { content = "❌ Player not found!", ephemeral = true })
        end
    else
        SendResponse(interactionData.interactionId, { content = "❌ Player parameter is required!", ephemeral = true })
    end
end, 'admin')