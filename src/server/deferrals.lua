function GetDiscordID(source)
    local identifiers = GetPlayerIdentifiers(source)
    for _, id in ipairs(identifiers) do
        if string.sub(id, 1, 8) == "discord:" then
            return string.sub(id, 9) -- strip "discord:" prefix
        end
    end
    return nil
end

AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local src = source
    deferrals.defer()

    Wait(0)

    local maxTries = 10
    local discordID = nil

    for i = 1, maxTries do
        deferrals.update(("🔍 Checking for Discord ID... (%d/%d)"):format(i, maxTries))
        discordID = GetDiscordID(src)
        if discordID then break end
        Wait(300)
    end

    if not discordID then
        deferrals.done("🛑 You must have Discord open and connected to join this server.\nMake sure Discord is running and restart FiveM.")
        return
    end

    deferrals.update("✅ Discord ID found. Finalizing connection...")
    Wait(500)

    deferrals.done()
end)
