import dotenv from 'dotenv';
import schedule from 'node-schedule';
import { createActor } from './createActor.js';
import { HttpAgent } from '@dfinity/agent';
import { idlFactory as bilIdlFactory } from './bil.did.js';
import { idlFactory as chatIdlFactory } from './chat.did.js';
import { idlFactory as minerIdlFactory } from './miner.did.js';
import { keepAlive } from './keep_alive.js';
import { convertTime } from './utils.js';

dotenv.config();

// Canister IDs
const BIL_BACKEND = 'hx36f-waaaa-aaaai-aq32q-cai';
const CHAT_BACKEND = '4jork-6yaaa-aaaam-ad3vq-cai';

// Initialize agent and actors
const agent = new HttpAgent({
    host: 'https://ic0.app'
});

const bilBackendActor = createActor(BIL_BACKEND, bilIdlFactory, agent);
const chatBackendActor = createActor(CHAT_BACKEND, chatIdlFactory, agent);

let previousBlockHeight = 0;

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

// Main monitoring function
async function monitor() {
    console.log('Monitoring...');
    try {
        const latestBlock = await bilBackendActor.get_latest_block();
        if (!latestBlock[0]) return;

        const currentBlockHeight = Number(latestBlock[0].header.height);
        console.log('Current block height:', latestBlock);

        if (previousBlockHeight != null && currentBlockHeight > previousBlockHeight) {
            //get te miner of the latest block
            let _miner = await bilBackendActor.get_stats(currentBlockHeight-1);
            
            let _minerPrincipal = _miner[0].miner
            
            
            const minerOwner = await getMinerOwner(_minerPrincipal);
            console.log('Miner Owner:', minerOwner);
            
            if (minerOwner) {
                // Store in chat backend
               let storeResults =  await chatBackendActor.store_blocks_data({
                    header: currentBlockHeight,
                    miner: _minerPrincipal,
                    minerOnwer: minerOwner.owner,
                    timestamp: _miner[0].timestamp
                });

                console.log('Store Results:', storeResults);


                // console.log('Stored miner info:', {
                //     blockHeight,
                //     miner: minerPrincipal.toString(),
                //     minerOwner: minerOwner.toString(),
                //     timestamp: convertTime(timestamp)
                // });
            }
        }else{
            console.log('No new blocks found');
        }

        previousBlockHeight = currentBlockHeight;
        
    } catch (error) {
        console.error('Error in monitor function:', error);
    }
}

// Keep alive server setup
keepAlive();

// Schedule monitoring
schedule.scheduleJob('*/5 * * * * *', monitor);

console.log('Miner Tracker Bot started...'); 