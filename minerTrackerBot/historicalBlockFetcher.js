import dotenv from 'dotenv';
import { createActor } from './createActor.js';
import { HttpAgent } from '@dfinity/agent';
import { idlFactory as bilIdlFactory } from './bil.did.js';
import { idlFactory as chatIdlFactory } from './chat.did.js';
import { idlFactory as minerIdlFactory } from './miner.did.js';
import { convertTime } from './utils.js';

dotenv.config();

// Canister IDs
const BIL_BACKEND = 'hx36f-waaaa-aaaai-aq32q-cai';
const CHAT_BACKEND = '4jork-6yaaa-aaaam-ad3vq-cai';

// Initialize agent and actors
const agent = new HttpAgent({
    host: 'https://ic0.app',
    retryTimes: 10
});
const bilBackendActor = createActor(BIL_BACKEND, bilIdlFactory, agent);
const chatBackendActor = createActor(CHAT_BACKEND, chatIdlFactory, agent);

// Function to get miner owner
async function getMinerOwner(minerPrincipal) {
    try {
        let minerActor = createActor(minerPrincipal, minerIdlFactory, agent);
        const state = await minerActor.get_state();
        return state;
    } catch (error) {
        console.error('Error getting miner owner:', error);
        return null;
    }
}

// Function to process a single block
async function processBlock(blockHeight) {
    try {
        console.log(`Processing block ${blockHeight}...`);
        
        let _miner = await bilBackendActor.get_stats(blockHeight);
        if (!_miner || !_miner[0]) {
            console.log(`No miner data for block ${blockHeight}`);
            return;
        }

        let _minerPrincipal = _miner[0].miner;
        const minerOwner = await getMinerOwner(_minerPrincipal);
        
        if (minerOwner) {
            let storeResults = await chatBackendActor.store_blocks_data({
                header: blockHeight,
                miner: _minerPrincipal,
                minerOnwer: minerOwner.owner,
                timestamp: _miner[0].timestamp
            });

            console.log(`Block ${blockHeight} stored successfully`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`Error processing block ${blockHeight}:`, error);
        return false;
    }
}

// Main function to fetch and store historical data
async function fetchHistoricalData() {
    try {
        // Get the current block height
        const latestBlock = await bilBackendActor.get_latest_block();
        if (!latestBlock[0]) {
            console.error('Could not get latest block');
            return;
        }

        const currentBlockHeight = Number(latestBlock[0].header.height);
        console.log(`Current block height: ${currentBlockHeight}`);

        // Process blocks in batches to avoid overwhelming the system
        const batchSize = 10;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 3500; i < currentBlockHeight; i += batchSize) {
            const batch = [];
            for (let j = 0; j < batchSize && (i + j) < currentBlockHeight; j++) {
                batch.push(processBlock(i + j));
            }

            // Process batch
            await Promise.all(batch);
            
            // Add a small delay between batches
            await delay(1000);

            console.log(`Processed blocks ${i} to ${Math.min(i + batchSize - 1, currentBlockHeight - 1)}`);
        }

        console.log('Historical data fetching completed');

    } catch (error) {
        console.error('Error in fetchHistoricalData:', error);
    }
}

// Run the historical data fetcher
console.log('Starting historical block fetcher...');
fetchHistoricalData().then(() => {
    console.log('Historical block fetcher completed');
    process.exit(0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 