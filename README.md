# server-backup

## About

Easy-to-use [Discord](https://discord.com/) server backup bot for [Node.js](https://nodejs.org/en/). Reposts sent message from configured servers to a backup, using Discord's Websocket API, which preserves author `avatar` and `username` properties.

## Compilation

- Prerequisite: [Yarn](https://yarnpkg.com/) package manager, Node.js v16+, [discord.js](https://discord.js.org/#/) v13+
- `tsc` to compile Typescript to Javascript
- `yarn start` to run the compiled code

## Setup

- Invite application to your server.
    - **NOTE**: requires OAuth scopes `bot` and `applications.commands`.
- Create a backup server, and invite bot to that as well. Run `/setup <guild_id>` in the server you wish to back up, where `guild_id` is the `id` of the target (backup) server. The bot will populate channels automatically.
    - **NOTE**: enable developer mode to copy guild id

## Usage

Just let the bot run and it will do what it's supposed to.
