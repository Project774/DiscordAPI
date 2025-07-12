
function IsDiscordID(id)
    return string.match(id, "^<@(%d+)>$")
end
exports("IsDiscordID", IsDiscordID)


function GetSource(id)
    local IsDiscord = IsDiscordID(id)
    if IsDiscord then
        local idType = "discord"
        for _, playerId in ipairs(GetPlayers()) do
            local identifiers = GetPlayerIdentifiers(playerId)
            for _, id in ipairs(identifiers) do
                if string.sub(id, 1, #idType + 1) == idType .. ":" then
                    if string.sub(id, #idType + 2) == IsDiscord then
                        return tonumber(playerId)
                    end
                end
            end
        end
    end
    return tonumber(id)
end
exports("GetSource", GetSource)