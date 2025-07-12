
_RegisterCommand('status', 'Show server status', {}, function(interactionData)
    local maxPlayers = GetConvarInt('sv_maxclients', 32)
    local currentPlayers = #GetPlayers()
    local uptime = GetGameTimer() / 1000 / 60 -- minutes
    
    local embed = {
        color = 0x0099ff,
        title = "🖥️ Server Status",
        fields = {
            {
                name = "Players",
                value = string.format("%d/%d", currentPlayers, maxPlayers),
                inline = true
            },
            {
                name = "Uptime",
                value = string.format("%.1f minutes", uptime),
                inline = true
            },
            {
                name = "Server Name",
                value = GetConvar('sv_hostname', 'FiveM Server'),
                inline = true
            }
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }
    
    SendResponse(interactionData.interactionId, { embeds = { embed } })
end)