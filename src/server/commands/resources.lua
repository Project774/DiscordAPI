
_RegisterCommand('resources', 'Manage server resources', {
    { name = 'action', description = 'Action to perform', type = 'string', required = true, choices = {
        { name = 'Ensure', value = 'ensure' },
        { name = 'Refresh', value = 'refresh' },
        { name = 'Start', value = 'start' },
        { name = 'Stop', value = 'stop' },
        { name = 'Restart', value = 'restart' }
    }},
    { name = 'resource', description = 'Name of the resource', type = 'string', required = false }
}, function(interactionData)
    if not interactionData.hasPermission then
        SendResponse(interactionData.interactionId, { 
            content = "❌ You don't have permission to use this command!", 
            ephemeral = true 
        })
        return
    end

    local action = nil
    local resourceName = nil

    for _, option in ipairs(interactionData.options) do
        if option.name == 'action' then
            action = option.value
        elseif option.name == 'resource' then
            resourceName = option.value
        end
    end

    if action ~= 'refresh' and not resourceName then
        SendResponse(interactionData.interactionId, { 
            content = "❌ Resource name is required for this action!", 
            ephemeral = true 
        })
        return
    end

    if resourceName and resourceName == GetCurrentResourceName() then 
        SendResponse(interactionData.interactionId, { 
            content = string.format("❌ You can't restart the %s resource!", GetCurrentResourceName()), 
            ephemeral = true 
        })
        return
    end

    local embed = {
        color = 0x00ff00,
        title = "🔧 Resource Management",
        description = "Processing your request...",
        fields = {},
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }

    if action == 'ensure' then
        ExecuteCommand('ensure ' .. resourceName)
        embed.description = string.format("✅ **Ensured resource:** %s", resourceName)
    elseif action == 'refresh' then
        ExecuteCommand('refresh')
        embed.description = "🔄 **Refreshed all resources**"
    elseif action == 'start' then
        ExecuteCommand('start ' .. resourceName)
        embed.description = string.format("▶️ **Started resource:** %s", resourceName)
    elseif action == 'stop' then
        ExecuteCommand('stop ' .. resourceName)
        embed.description = string.format("⏹️ **Stopped resource:** %s", resourceName)
    elseif action == 'restart' then
        ExecuteCommand('restart ' .. resourceName)
        embed.description = string.format("🔄 **Restarted resource:** %s", resourceName)
    end

    SendResponse(interactionData.interactionId, { embeds = { embed } })
end, 'admin')