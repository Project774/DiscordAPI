fx_version 'cerulean'
game 'gta5'

lua54 'yes'
use_experimental_fxv2_oal 'yes'

server_only 'yes' --maybe

-- client_scripts {
-- 	'src/client/*',
-- }

server_scripts {
    'src/server/server.js',
    'src/server/deferrals.lua',
    'src/server/commands.lua',
    'src/server/commands/*.lua',
}