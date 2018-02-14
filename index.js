'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const Discord = require('discord.js');

const TOKEN = fs.readFileSync('token', 'utf8').trim();
const DOOT_PATH = path.join('doot.mp3');
const DOOT_INTERVAL = 3000;
const COMMAND_PREFIX = '/';

const setTimeoutPromise = util.promisify(setTimeout);

class Dootbot {
	constructor(token) {
		this.client = new Discord.Client();
		this._voiceConnections = new Map();

		this.client.on('ready', this._onReady.bind(this));

		this.client.on('message', this._onMessage.bind(this));

		this.client.login(token).catch(console.error);
	}

	_onReady() {
		console.log('Ready!');
	}

	_onMessage(message) {
		if (message.content.startsWith(COMMAND_PREFIX)) {
			switch (message.content.slice(COMMAND_PREFIX.length)) {
				case 'doot':
					this._doot(message).catch(console.error);
					break;
				case 'desist':
					this._desist(message).catch(console.error);
					break;
			}
		}
	}

	async _doot(message) {
		const member = message.member;
		if (!member) {
			return;
		}
		if (!member.voiceChannel) {
			await message.reply('get in a VC to doot!');
			return;
		}
		const voiceConnection = await member.voiceChannel.join();
		this._voiceConnections.set(member.voiceChannelID, voiceConnection);
		while (this._voiceConnections.get(member.voiceChannelID)) {
			const dispatcher = voiceConnection.playFile(DOOT_PATH);
			dispatcher.setVolume(0.3);
			await setTimeoutPromise(DOOT_INTERVAL);
		}
	}

	async _desist(message) {
		const member = message.member;
		if (!member) {
			return;
		}
		if (!member.voiceChannel) {
			await message.reply(`you're not in a voice channel`);
			return;
		}
		if (this._voiceConnections.get(member.voiceChannelID)) {
			this._voiceConnections.get(member.voiceChannelID).disconnect();
			this._voiceConnections.delete(member.voiceChannelID);
		}
	}
}

const dootbot = new Dootbot(TOKEN);
