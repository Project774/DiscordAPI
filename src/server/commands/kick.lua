
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

    local player = interactionData.options[1] and interactionData.options[1].value
    local reason = interactionData.options[2] and interactionData.options[2].value

    local source = GetSource(player)

    if source then
        DropPlayer(source, reason or 'No reason provided')
        SendResponse(interactionData.interactionId, { content = string.format("✅ Kicked %s for: %s", player, reason or 'No reason provided') })
    else
        SendResponse(interactionData.interactionId, { content = "❌ Player not found!", ephemeral = true })
    end
end, 'admin')