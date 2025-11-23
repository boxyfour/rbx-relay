# rbx-relay

a relay(?) server for roblox

## features

* can send global commands to roblox servers; the first server to receive the command will execute it.
* can send server-specific commands, only the server will run it
* has basic authentication

## prerequisites

* install nodejs & the typescript compilers
* have redis installed

## usage

create an .env file and fill out the following fields:

* SERVER_SECRET (roblox server credentials)
* REGISTER_SECRET (maybe not in use anymore?)
* DISCORD_TOKEN (discord bot token)
* GUILDID (guild-specific id)
* CLIENTID (application id of the discord bot)

clone the repository, and run:

```sh
npm run start
```

assuming you've installed the [rblx-client-relay](https://github.com/boxyfour/rbx-client-relay), configure src/bot/commands/polling to your liking and enjoy!

# todo

* add command failures(?) (might not be possible, if a command succeeds but the server fails to send the request, could occur multiple times)
* finish discord bot