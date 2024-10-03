import { enabledConfig } from "./config";
import { joinRoom, loadBlock } from "./utils/";
import EventEmitter from "events";

const solanaBlocks = [
    {
        "baseFee": 13457093422,
        "busCapacity": 40000000,
        "coin": "SOL",
        "gl": 40000000,
        "gu": 30050400,
        "hash": "5fjw3YbCHxzKfuHYqY5hbLQTw7ZT4p1UxofzTZ2XfgrZ",
        "height": 15872345,
        "hoursPast": 0,
        "inserted": 1727881500,
        "minerTime": 1727881498,
        "parentHash": "4fG4eQywHWb7ZZRR8MQWnxHVNwfS3iPRFTE3fJFWuXHZ",
        "processed": true,
        "size": 126475,
        "time": 1727881500,
        "txs": 240,
        "uncle": false,
        "verbose": false
    },
    {
        "baseFee": 12189012456,
        "busCapacity": 50000000,
        "coin": "SOL",
        "gl": 50000000,
        "gu": 40560000,
        "hash": "3Eo21uJ5MLmg2jpUV6aZdHrjh5FMZTHmTpTczZFN4g5G",
        "height": 15875012,
        "hoursPast": 0,
        "inserted": 1727882600,
        "minerTime": 1727882598,
        "parentHash": "9PfLk7LRJgV7Yhz8p5GGHfJF9r7gHpZJfWnKLbXrQvST",
        "processed": true,
        "size": 116732,
        "time": 1727882600,
        "txs": 195,
        "uncle": false,
        "verbose": false
    },
    {
        "baseFee": 14750923219,
        "busCapacity": 60000000,
        "coin": "SOL",
        "gl": 60000000,
        "gu": 51200950,
        "hash": "AfwB19XbTfZQrBxjsSykWf2Rpy6e6tVhLqyxV7Sk82Jr",
        "height": 15876018,
        "hoursPast": 0,
        "inserted": 1727883100,
        "minerTime": 1727883098,
        "parentHash": "6K2LpMVET6Gw8eqRctTXsFWUJwFZh9xHkfFgXePyzCZ5",
        "processed": true,
        "size": 152500,
        "time": 1727883100,
        "txs": 320,
        "uncle": false,
        "verbose": false
    },
    {
        "baseFee": 13045672189,
        "busCapacity": 55000000,
        "coin": "SOL",
        "gl": 55000000,
        "gu": 45000950,
        "hash": "72XL9Gkhs5sCrvHYUEAhPtyMLD5syHf7nJXhQKXfFNNp",
        "height": 15878001,
        "hoursPast": 0,
        "inserted": 1727883800,
        "minerTime": 1727883798,
        "parentHash": "3FLNUE7MvLCXcUBTpKj7KZLz8K1PhcTpA2oGrxt2ChzR",
        "processed": true,
        "size": 123350,
        "time": 1727883800,
        "txs": 250,
        "uncle": false,
        "verbose": false
    },
    {
        "baseFee": 11508791233,
        "busCapacity": 48000000,
        "coin": "SOL",
        "gl": 48000000,
        "gu": 37500300,
        "hash": "5Pjcv1kALXzAEHR2xjUUL1B4FaPBoNJe2GZqzVVc5HYF",
        "height": 15879021,
        "hoursPast": 0,
        "inserted": 1727884200,
        "minerTime": 1727884198,
        "parentHash": "8M7DZXhxbh7p7ZPMxyvUXBzjqDyNTX7hNFy4qjKw5rDv",
        "processed": true,
        "size": 143700,
        "time": 1727884200,
        "txs": 275,
        "uncle": false,
        "verbose": false
    }
]


class blockFactory extends EventEmitter {
	constructor(ticker) {
        super();
        this.connected = false;
        this.config = enabledConfig[ticker];
        this.blockchain = this.config.liveBlocks;
        this.blocksWaiting = {};
        this.ticker = ticker;
        console.log(`blockFactory created for ${ticker}`);
    }

    connect() {
        console.log(`Attempting to connect for ${this.ticker}`);
        
        if (this.ticker === 'SOLANA') {
            this.handleSolanaData();
        } else {
            this.socket = joinRoom(this.config, "blocks");
            console.log(`Socket created for ${this.ticker}:`, this.socket);

            if (this.connected) {
                console.log(`Already connected for ${this.ticker}`);
                this.emit("connected");
                return;
            }

            this.connected = true;
            this.socket.once("latestblocks", async hashes => {
                console.log(`Received latestblocks for ${this.ticker}:`, hashes);
                if (hashes.length) {
                    let blocks = hashes;
                    if (typeof hashes[0] === "string") {
                        let tasks = [];
                        hashes.forEach(hash => {
                            tasks.push(fetch(`${process.env.VUE_APP_REST_API}/static/blocks/${this.ticker}/${hash}?verbose=false`));
                        });
                        let responses;
                        try {
                            responses = await Promise.all(tasks);
                        } catch (err) {
                            console.error(`Error fetching blocks for ${this.ticker}:`, err);
                            this.emit("error", err);
                            return;
                        }					
                        blocks = await Promise.all(responses.map(async res => res.json()));	
                    }
                    console.log(`Processed blocks for ${this.ticker}:`, blocks);

                    blocks.sort((a, b) => b.height - a.height);
                    for (let i = blocks.length - 1; i >= 0; i--) {
                        let block = blocks[i];
                        this.addBlock(block, false, true, true);
                    }
                }

                this.emit("connected");
            });

            this.socket.on("block", async (hash) => {
                console.log(`Received new block for ${this.ticker}:`, hash);
                if (typeof hash === "string") {
                    this.getBlock(hash);
                } else {
                    this.addBlock(hash);
                }
            });

            this.socket.on("connect", () => {
                console.log(`WebSocket connected for ${this.ticker}`);
            });

            this.socket.on("disconnect", (reason) => {
                console.log(`WebSocket disconnected for ${this.ticker}. Reason:`, reason);
            });

            this.socket.on("error", (error) => {
                console.error(`WebSocket error for ${this.ticker}:`, error);
            });
        }
    }

    handleSolanaData() {
        console.log('Processing SOLANA data');
        solanaBlocks.forEach(block => {
            this.addBlock(block, false, true, true);
        });
        this.emit("connected");
        
        // Simulate receiving new blocks every 10 seconds
        setInterval(() => {
            const newBlock = this.generateSolanaBlock();
            console.log('Received new SOLANA block:', newBlock);
            this.addBlock(newBlock);
        }, 10000);
    }

    generateSolanaBlock() {
        const lastBlock = this.blockchain[this.blockchain.length - 1];
        return {
            ...solanaBlocks[0],
            height: lastBlock ? lastBlock.height + 1 : 15879022,
            hash: 'SOL' + Math.random().toString(36).substring(2, 15),
            parentHash: lastBlock ? lastBlock.hash : solanaBlocks[solanaBlocks.length - 1].hash,
            time: Math.floor(Date.now() / 1000),
            minerTime: Math.floor(Date.now() / 1000) - 2,
            inserted: Math.floor(Date.now() / 1000),
        };
    }

	checkMissingBlocks() {
		if (!this.blockchain.length) return;
		let heights = Object.keys(this.blocksWaiting);
		if (!heights.length) return;
		heights.sort(function (a, b) {
			return a - b;
		});
		let blocksByHeight = this.blocksByHeight();

		for (let i = 0; i < heights.length; i++) {
			const height = heights[i];
			let [data, sendNotification, processed] = this.blocksWaiting[height];
			if (blocksByHeight[height - 1]) {
				//parent exists
				delete this.blocksWaiting[height];
				if (!this.addBlock(data, sendNotification, processed)) return;
				continue;
			} else {
				//parent does not exist
				this.getBlock(data.parentHash);
				return;
			}
		}
	}

	addUncle(data) {
		if (this.hashExistsInBlockchain(data.hash)) return false;
		data.processed = true;
		let spliced = false;
		for (let i = 0; i < this.blockchain.length; i++) {
			const block = this.blockchain[i];
			if (data.hash == block.hash) return false;
			if (data.height == block.height) {
				this.blockchain.splice(++i, 0, data);
				spliced = true;
			}
		}
		if (!spliced) this.blockchain.splice(1, 0, data);
		if (typeof data.txFull !== "undefined") {
			const txArray = Object.keys(data.txFull || {});
			for (let i = 0; i < txArray.length; i++) {
				const tx = txArray[i];
				this.emit("deleteLinePerson", tx);
			}
		}
	}

	addBlock(data, sendNotification = true, processed = false, ignoreHeight = false) {
        console.log(`Adding block for ${this.ticker}:`, data);
		if (this.hashExistsInBlockchain(data.hash)) return false;
		if (!data) return false;
		
		if (this.blockchain.length && !ignoreHeight && !this.config.isRollup) {
			const highestBlocks = this.highestBlocks();
			if (data.height <= highestBlocks[0].height) {
				//height not greater than last block
				this.addUncle(data);
				return true;
			} else {
				if (data.height !== highestBlocks[0].height + 1 && highestBlocks[0].height - data.height < 50) {
					//is not the next block
					this.blocksWaiting[data.height] = [data, sendNotification, processed];
					this.checkMissingBlocks();
					return false;
				}
			}
		}

		data.processed = processed;
		data.busCapacity = this.config.busCapacity;
		data.hoursPast = 0;
		data.uncle = false;

		data.minerTime = data.time;
		if (data.inserted) {
			if (Math.abs(data.time - data.inserted) < 300 && data.inserted > data.time) data.time = data.inserted;
		}

		//add fee info to block from txFull		
		this.config.calcBlockFeeArray(data);

		this.blockchain.push(Object.seal(data));
		if (typeof data.uncles !== "undefined" && !processed) {
			this.setUncles(data.uncles);
		}

		this.emit("addBlock", data, sendNotification);
		this.deleteOldBlocks();
		return true;
	}

	deleteOldBlocks() {
		if (this.blockchain.length > this.config.maxBlocksToKeep) {
			let maxDelete = Math.abs(this.config.maxBlocksToKeep - this.blockchain.length);
			let howMany = 0;
			for (let i = 0; i < this.blockchain.length; i++) {
				const block = this.blockchain[i];
				if (!block.processed && window.txPhaser) {
					this.emit("fastProcessBlock", block);
					break;
				}
				howMany = i + 1;
				this.emit("deleteTxsFromBlock", block);
				if (howMany >= maxDelete) break;
			}
			if (howMany) this.blockchain.splice(0, howMany);
		}
	}

	blocksByHeight() {
		//sort all blocks into arrays with the same height, object array instead of single array, because uncles can have the same height
		let heights = {};
		for (let i = 0; i < this.blockchain.length; i++) {
			const block = this.blockchain[i];
			if (typeof heights[block.height] === "undefined") heights[block.height] = [];
			heights[block.height].push(block);
		}
		return heights;
	}

	highestBlocks(h = false) {
		//get array of blocks with heighest height, can be multiple because uncles
		const heights = h || this.blocksByHeight();
		let keys = Object.keys(heights);
		keys.sort(function (a, b) {
			return b - a;
		});
		return heights[keys[0]];
	}

	setUncles(hashes, fetchUnloaded = true) {
		for (let i = 0; i < this.blockchain.length; i++) {
			const block = this.blockchain[i];
			if (hashes.includes(block.hash)) {
				this.blockchain[i].uncle = true;
				hashes.splice(hashes.indexOf(block.hash), 1);
			}
		}
		//remaining uncles that were not loaded
		if (fetchUnloaded) {
			for (let i = 0; i < hashes.length; i++) {
				const uncleHash = hashes[i];
				this.getUncle(uncleHash);
			}
		}
	}

	async getUncle(hash) {
		let block = await loadBlock(this.config.ticker, hash);
		if (!block) return false;
		this.addBlock(block, false, true);
		this.setUncles([hash], false);
	}

	async getBlock(hash) {
		if (this.hashExistsInBlockchain(hash)) return false;
		let block = await loadBlock(this.config.ticker, hash);
		if (!block) return false;
		this.addBlock(block);
	}

	hashExistsInBlockchain(hash) {
		for (let i = 0; i < this.blockchain.length; i++) {
			const block = this.blockchain[i];
			if (block.hash == hash) return true;
		}
		return false;
	}
}

const manualTickers = ['ETH', 'SOLANA'];

const blockFactories = {};
manualTickers.forEach(ticker => {
    if (enabledConfig[ticker]) {
        console.log(`Creating blockFactory for ${ticker}`);
        blockFactories[ticker] = new blockFactory(ticker);
        blockFactories[ticker].connect();
    } else {
        console.error(`Configuration for ${ticker} not found in enabledConfig`);
    }
});

console.log('Created blockFactories:', Object.keys(blockFactories));

export default blockFactories;
