local commandCB = {}

function _RegisterCommand(name, description, options, cb, perms)
    if commandCB[name] then 
        print(('[DiscordAPI] Command %s already registered, overriding...'):format(name)) 
    end
    TriggerEvent('DiscordAPI:RegisterCommand', name, description, options, perms)
    commandCB[name] = cb
end
exports('RegisterCommand', _RegisterCommand)

-- Probably exploitable but i like
function ExecuteGameCommand(...)
    ExecuteCommand(...)
end
exports('ExecuteGameCommand', ExecuteGameCommand)

function SendResponse(interactionId, response, callback)
    if callback then
        local handler
        handler = AddEventHandler(('DiscordAPI:MessageSent:%s'):format(interactionId), function()
            RemoveEventHandler(handler)
            callback()
        end)
        TriggerEvent('DiscordAPI:SendResponse', interactionId, response)
    else
        TriggerEvent('DiscordAPI:SendResponse', interactionId, response)
    end
end
exports('SendResponse', SendResponse)

AddEventHandler('DiscordAPI:CommandExecuted', function(interactionData)
    local commandName = interactionData.commandName
    if not commandCB[commandName] then print(('DiscordAPI: Command not %s registered'):format(commandName)) return end
    commandCB[commandName](interactionData)
end)