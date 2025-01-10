require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const schedule = require('node-schedule');

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
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
            botChats.add(chatId);
            console.log(`Bot added to group: ${msg.chat.title} (${chatId})`);
            safeMessageSend(chatId, '👋 Hello! I am now active in this group and will send periodic updates.');
        }
    });

    // Handle when bot is added to a group
    bot.on('group_chat_created', (msg) => {
        const chatId = msg.chat.id;
        botChats.add(chatId);
        safeMessageSend(chatId, '👋 Thank you for creating a group with me! I am now active and will send periodic updates.');
    });

    bot.on('new_chat_members', (msg) => {
        if (msg.new_chat_members.some(member => member.id === bot.botInfo.id)) {
            const chatId = msg.chat.id;
            botChats.add(chatId);
            safeMessageSend(chatId, '👋 Thank you for adding me! I am now active and will send periodic updates.');
        }
    });
}

// Safe message sending with retry logic
async function safeMessageSend(chatId, message, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await bot.sendMessage(chatId, message);
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
    for (const chatId of botChats) {
        await safeMessageSend(chatId, message);
    }
}

// Function to send activity message
async function sendActivityMessage() {
    if (!isConnected) return;
    for (const chatId of botChats) {
        await safeMessageSend(chatId, '🟢 I am active and monitoring!');
    }
}

// Function to fetch data
async function fetchData() {
    let number = 0;
    try {
        number++;
        return number;
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
    if (previousValue !== null && currentValue > previousValue) {
        const message = `🔔 Number increased!\nPrevious: ${previousValue}\nCurrent: ${currentValue}\nIncrease: ${currentValue - previousValue}`;
        await sendNotificationToAllGroups(message);
    }
    previousValue = currentValue;
}

// Initialize the bot
initializeBot();

// Schedule tasks only after successful connection
if (isConnected) {
    // Schedule the monitoring to run every second
    schedule.scheduleJob('* * * * * *', monitor);

    // Schedule activity message every minute
    schedule.scheduleJob('*/1 * * * *', sendActivityMessage);

    console.log('Monitoring service started...');
} 