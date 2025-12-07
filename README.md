# rbx-relay

a relay server for roblox

## Features



A basic standalone http server that interacts with a redis database to store actions. If you'd like to connect this with a discord bot, check out my other repository at

## prerequisites

Note that you shouldn't run this on your home computer. Windows systems are annoying to set up Redis on, and if you're sharing access to game with with other collaborators, they're able to view your IP address. Instead, check out solutions like [Oracle Cloud](https://www.oracle.com/cloud/free/), or [Digital Ocean](https://www.digitalocean.com/solutions/.vps-hosting). Then, follow the set-up guide listed later down.

* install [nodejs](https://nodejs.org/en) & the [typescript](https://www.typescriptlang.org/download/) compilers
* have [redis](https://redis.io/downloads/) installed
* have [nginx](https://nginx.org/index.html) installed (optional)

## usage

create an .env file and fill out the following fields:

* SERVER_SECRET (roblox server credentials)
* REGISTER_SECRET (discord bot credentials)

clone the repository, and run:

```sh
npm run start
```

Now your http server is up and running! You can configure nginx to act as a reverse proxy, meaning you don't have to set up HTTPS manually with this project. If you'd like to do this, check out [this guide](https://nginx.org/en/docs/http/configuring_https_servers.html).

## Important

### Issues

If there are any issues you'd like to report, you can create an issue [here](https://github.com/boxyfour/rbx-relay/issues). Before doing that, though, please go through the following common issues you might have.

> I'm running the http server, discord bot, and roblox client set up, but I won't receive messages!!!1!11!

There's a few possibitlies for this occuring:

### Didn't port forward, or accidentally set the wrong port

If you're running the server at home, anything you host **wont** be exposed to the internet unless you decide to expose it. There are a plethora of reasons why this is, but just know, you'll have to set up port-forwarding on your server to actually connect to the bot. 

Otherwise, if you're hosting this on a VPS, check if your port matches the one you're connecting to.

### Discord bot doesn't have database access

If you're running this on two VPS's or home servers, this is probably what's occuring. The discord bot and http server don't actually communicate; instead, the discord bot receives messages from the database, and the http api acts as a wrapper for the database.

A simple fix for this is to run your discord bot and http server on the same VPS.