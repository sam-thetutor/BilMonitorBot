import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import schedule from 'node-schedule';
import { createActor } from './createActor.js';
import { HttpAgent } from '@dfinity/agent';
import { idlFactory } from './bil.did.js';
import { idlFactory as storecanisterIdlFactory } from './storecanister.did.js';
import { convertTime, shortenAddress } from './constants.js';
import { DiscordBot } from './discordBot.js';

dotenv.config();

// Bot configuration with additional options
const botOptions = {
    polling: true,
    request: {
        timeout: 30000, // Increase timeout to 30 seconds
        proxy: false,   // Disable proxy
        retry: 5,       // Number of retries
        connect_timeout: 30000 // Connection timeout
    }
};

let bot;
let isConnected = false;
let latestBlock = 0;
let ICPSWAP_URL = 'https://www.kongswap.io/swap?from=ktra4-taaaa-aaaag-atveq-cai&to=ryjl3-tyaaa-aaaaa-aaaba-cai';
let KONGSWAP_URL = 'https://www.kongswap.io/swap?from=ktra4-taaaa-aaaag-atveq-cai&to=ryjl3-tyaaa-aaaaa-aaaba-cai';
let WEBSITE_URL = 'https://xnrj3-raaaa-aaaad-aaepq-cai.icp0.io/';

let BIL_BACKEND = 'hx36f-waaaa-aaaai-aq32q-cai';
let STORE_CANISTER = "ja3mj-viaaa-aaaan-qzq2q-cai";

const agent = new HttpAgent({
    host: 'https://ic0.app'
} );


let bilBackendActor = createActor(BIL_BACKEND,idlFactory, agent);
let storecanisterActor = createActor(STORE_CANISTER,storecanisterIdlFactory, agent);

const discordBot = new DiscordBot();
await discordBot.initialize();

// Function to initialize bot with reconnection logic
function initializeBot() {
    try {
        bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, botOptions);
        isConnected = true;
        console.log('Bot successfully connected to Telegram servers');

        // Reset connection on error
        bot.on('error', (error) => {
            console.error('Bot error:', error.message);
            if (isConnected) {
                isConnected = false;
                console.log('Attempting to reconnect in 5 seconds...');
                setTimeout(reconnectBot, 5000);
            }
        });

        // Handle polling errors
        bot.on('polling_error', (error) => {
            console.error('Polling error:', error.message);
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
                if (isConnected) {
                    isConnected = false;
                    console.log('Connection timeout. Attempting to reconnect in 5 seconds...');
                    setTimeout(reconnectBot, 5000);
                }
            }
        });

        setupBotHandlers();
        
    } catch (error) {
        console.error('Failed to initialize bot:', error);
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(initializeBot, 5000);
    }
}

// Function to reconnect bot
function reconnectBot() {
    if (!isConnected) {
        try {
            if (bot) {
                bot.stopPolling();
            }
            initializeBot();
        } catch (error) {
            console.error('Reconnection failed:', error);
            console.log('Retrying in 5 seconds...');
            setTimeout(reconnectBot, 5000);
        }
    }
}

// Store chat IDs where the bot is added
const botChats = new Set();
let previousValue = null;

// Setup bot event handlers
function setupBotHandlers() {
    // Listen for new group additions
    bot.on('message', async(msg) => {
        const chatId = msg.chat.id;
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
           let h= await storecanisterActor.addTelegramGroupCode(chatId.toString());
            botChats.add(chatId);
            console.log(`Bot added to group: ${msg.chat.title} (${chatId})`);
            console.log("chat id added to the canister",h);
            safeMessageSend(chatId, '👋 Hello! I am now active in this group and will send periodic updates.');
        }
    });

    // Handle when bot is added to a group
    bot.on('group_chat_created', async(msg) => {
        const chatId = msg.chat.id;
        // botChats.add(chatId);
        console.log("chat id added to the canister",chatId?.toString());
        let h= await storecanisterActor.addTelegramGroupCode(chatId.toString());
        console.log("chat id added to the canister",chatId);
        safeMessageSend(chatId, '👋 Thank you for creating a group with me! I am now active and will send periodic updates.');
    });

    bot.on('new_chat_members', async(msg) => {
        if (msg.new_chat_members.some(member => member.id === bot.botInfo.id)) {
            const chatId = msg.chat.id;
            // botChats.add(chatId);
            let h= await storecanisterActor.addTelegramGroupCode(chatId.toString());
            console.log("chat id added to the canister",chatId);
            safeMessageSend(chatId, '👋 Thank you for adding me! I am now active and will send periodic updates.');
        }
    });
}

// Safe message sending with retry logic
async function safeMessageSend(chatId, message, inlineKeyboard, retries = 3,) {
    for (let i = 0; i < retries; i++) {
        try {
            await bot.sendMessage(chatId, message,inlineKeyboard);
            return true;
        } catch (error) {
            if (error.response && error.response.statusCode === 403) {
                botChats.delete(chatId);
                console.log(`Bot removed from chat ${chatId}, removing from list`);
                return false;
            }
            if (i === retries - 1) {
                console.error(`Failed to send message to ${chatId} after ${retries} attempts:`, error.message);
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
// Function to send notification to all groups
async function sendNotificationToAllGroups(message) {
    const urls = {
        icpswap: ICPSWAP_URL,
        kongswap: KONGSWAP_URL,
        website: WEBSITE_URL
    };

    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🌟 ICPSwap!',
                        url: ICPSWAP_URL
                    },
                    {
                        text: '🎉 KongSwap!',
                        url: KONGSWAP_URL
                    }
                ],
                [
                    {
                        text: '🎊 Website!',
                        url: WEBSITE_URL,
                        callback_data: 'celebrate'
                    }
                ]
            ]
        },
        parse_mode: 'HTML'
    };

    // Send to Telegram
    let chatIds = await storecanisterActor.getTelegramGroupCodes();
    chatIds = [...new Set(chatIds)];
    for (const chatId of chatIds) {
        await safeMessageSend(chatId, message, inlineKeyboard);
    }

    // Send to Discord
    await discordBot.sendMessage(message, urls);
}

// Function to send activity message
async function sendActivityMessage() {
    console.log("bot is running")

}

// Function to fetch data
async function fetchData() {


    let number = 0;
    try {

        let results = await bilBackendActor.get_all_blocks();
        console.log("current block height :",results.length);
        return results.length


        
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
    }
}

// Main monitoring function
async function monitor() {
    if (!isConnected) return;
    const data = await fetchData();
    if (!data) return;

    const currentValue = data;
    if (previousValue !== null && Number(currentValue) > Number(previousValue)) {

        //get the info about the latest block

        let latestBlock = await bilBackendActor.get_latest_block()
        console.log("latest block",latestBlock[0].transactions);


        let blockHeight = Number(latestBlock[0].header.height)
        let receiver = latestBlock[0].transactions[0].recipient?.toString()
        //shoten


        let timeStamp = convertTime(latestBlock[0].transactions[0].timestamp)

        const message = `🔔🔔🔔 New Bil Block! 🔔🔔🔔 \nBlock Number: ${blockHeight}\nBlockReward: 600 BIL\nMinedBy: ${shortenAddress(receiver)}\nTime: ${timeStamp}`;
        console.log("message",message)

        await sendNotificationToAllGroups(message);
    }
    previousValue = currentValue;
    console.log("previous value",previousValue);
    console.log("current value",currentValue);
}

// Initialize the bot
initializeBot();

// Schedule tasks only after successful connection
if (isConnected) {
    // Schedule the monitoring to run every 1 seconds
    schedule.scheduleJob('*/10 * * * * *', monitor);

   // Schedule activity message every minute
    schedule.scheduleJob('*/10 * * * *', sendActivityMessage);

    console.log('Monitoring service started...');
} 