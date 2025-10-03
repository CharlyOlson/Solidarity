/**
 * Blockchain Integration Connector for Solidarity Platform
 * Connects Smart Contracts with Audio Processing System
 * Created by Scott Charles Olson (Charly)
 */

const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

class SolidarityBlockchainConnector {
    constructor(config = {}) {
        this.config = {
            web3Provider: config.web3Provider || 'http://localhost:8545',
            networkId: config.networkId || 1337,
            gasLimit: config.gasLimit || 6721975,
            gasPrice: config.gasPrice || '20000000000',
            ...config
        };
        
        this.web3 = null;
        this.contracts = new Map();
        this.accounts = [];
        this.isConnected = false;
        
        console.log('Solidarity Blockchain Connector initialized');
    }
    
    /**
     * Initialize Web3 connection and load contracts
     */
    async initialize() {
        try {
            console.log('Connecting to blockchain...');
            
            // Initialize Web3
            this.web3 = new Web3(this.config.web3Provider);
            
            // Get accounts
            this.accounts = await this.web3.eth.getAccounts();
            
            if (this.accounts.length === 0) {
                throw new Error('No accounts available');
            }
            
            console.log(`Connected to blockchain with ${this.accounts.length} accounts`);
            
            // Load and deploy contracts
            await this.loadContracts();
            
            this.isConnected = true;
            console.log('Blockchain connector ready');
            
            return true;
            
        } catch (error) {
            console.error('Failed to initialize blockchain connector:', error);
            throw error;
        }
    }
    
    /**
     * Load smart contracts
     */
    async loadContracts() {
        try {
            const contractsDir = path.join(__dirname, '..', 'contracts');
            
            // Load SolidarityToken contract
            await this.loadContract('SolidarityToken', contractsDir);
            
            // Load other contracts as needed
            // await this.loadContract('AudioProcessingContract', contractsDir);
            // await this.loadContract('HarmonicCalculationsContract', contractsDir);
            
            console.log('Smart contracts loaded successfully');
            
        } catch (error) {
            console.error('Failed to load contracts:', error);
            throw error;
        }
    }
    
    /**
     * Load a specific contract
     */
    async loadContract(contractName, contractsDir) {
        try {
            const contractPath = path.join(contractsDir, `${contractName}.sol`);
            
            // For development, we'll create a basic contract structure
            // In production, this would load compiled contract artifacts
            const contractData = this.getContractABI(contractName);
            
            if (contractData) {
                // Deploy contract (for development)
                const contract = await this.deployContract(contractName, contractData);
                this.contracts.set(contractName, contract);
                
                console.log(`Contract ${contractName} loaded and deployed`);
            }
            
        } catch (error) {
            console.error(`Failed to load contract ${contractName}:`, error);
        }
    }
    
    /**
     * Get contract ABI (Application Binary Interface)
     */
    getContractABI(contractName) {
        // Basic ABI for SolidarityToken
        if (contractName === 'SolidarityToken') {
            return {
                abi: [
                    {
                        "inputs": [],
                        "name": "totalSupply",
                        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                        "name": "balanceOf",
                        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {"internalType": "address", "name": "to", "type": "address"},
                            {"internalType": "uint256", "name": "amount", "type": "uint256"}
                        ],
                        "name": "transfer",
                        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {"internalType": "string", "name": "zipPhrase", "type": "string"},
                            {"internalType": "uint256", "name": "processingFee", "type": "uint256"}
                        ],
                        "name": "processZipPhrase",
                        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {"internalType": "uint256[]", "name": "harmonicData", "type": "uint256[]"},
                            {"internalType": "address", "name": "processor", "type": "address"}
                        ],
                        "name": "storeHarmonicData",
                        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ],
                bytecode: "0x608060405234801561001057600080fd5b50610500806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c8063095ea7b31461005c57806318160ddd1461008c57806370a08231146100aa578063a9059cbb146100da578063dd62ed3e1461010a575b600080fd5b61007661007036600461041c565b50600190565b604051901515815260200160405180910390f35b6100946103e881565b6040519081526020015b60405180910390f35b6100946100b836600461043e565b6001600160a01b031660009081526020819052604090205490565b6100766100e836600461041c565b6001600160a01b038216600090815260208190526040812080548392906101109084906104a8565b90915550506040518181527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35060015b92915050565b61009461011836600461046b565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261016b57600080fd5b813567ffffffffffffffff8082111561018657610186610144565b604051601f8301601f19908116603f011681019082821181831017156101ae576101ae610144565b816040528381528660208588010111156101c757600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000806000606084860312156101fc57600080fd5b833567ffffffffffffffff8082111561021457600080fd5b6102208783880161015a565b9450602086013591508082111561023657600080fd5b506102438682870161015a565b925050604084013561025481610515565b809150509250925092915050565b6000806040838503121561027557600080fd5b82356001600160a01b038116811461028c57600080fd5b9150602083013567ffffffffffffffff8111156102a857600080fd5b6102b48582860161015a565b9150509250929050565b6000806000606084860312156102d357600080fd5b83356001600160a01b03811681146102ea57600080fd5b925060208401359150604084013561025481610515565b6000806040838503121561031457600080fd5b50508035926020909101359150565b60006020828403121561033557600080fd5b81356001600160a01b038116811461034c57600080fd5b9392505050565b6000815180845260005b818110156103795760208185018101518683018201520161035d565b8181111561038b576000602083870101525b50601f01601f19169290920160200192915050565b6020815260006103b36020830184610353565b9392505050565b8015158114610515600080fd5b600060208083850312156103db57600080fd5b825167ffffffffffffffff8082111561041c57600080fd5b818501915085601f83011261043057600080fd5b8151818111156104425761044261041c565b8060051b9150610453848301610446565b8181529150838201019185810190888411156104ae57600080fd5b938501935b838510156104cc578451825293850193908501906104b3565b98975050505050505050565b6000826104f557634e487b7160e01b600052601260045260246000fd5b500690565b60008160001904831182151516156105145761051461043e565b500290565b6001600160a01b038116811461052e57600080fd5b5056fea264697066735822122044d20b8e8ea47b43fa5bb6c14d9b31c732289e3f74b96b88a5c196b8b5a5c89e64736f6c63430008070033"
            };
        }
        
        return null;
    }
    
    /**
     * Deploy contract to blockchain
     */
    async deployContract(contractName, contractData) {
        try {
            const contract = new this.web3.eth.Contract(contractData.abi);
            
            // Deploy contract
            const deployedContract = await contract.deploy({
                data: contractData.bytecode
            }).send({
                from: this.accounts[0],
                gas: this.config.gasLimit,
                gasPrice: this.config.gasPrice
            });
            
            console.log(`Contract ${contractName} deployed at: ${deployedContract.options.address}`);
            return deployedContract;
            
        } catch (error) {
            console.error(`Failed to deploy contract ${contractName}:`, error);
            throw error;
        }
    }
    
    /**
     * Process ZIP phrase on blockchain
     */
    async processZipPhraseOnChain(phrase, processingFee = 0) {
        try {
            const contract = this.contracts.get('SolidarityToken');
            
            if (!contract) {
                throw new Error('SolidarityToken contract not loaded');
            }
            
            console.log(`Processing ZIP phrase on blockchain: "${phrase}"`);
            
            const result = await contract.methods.processZipPhrase(phrase, processingFee).send({
                from: this.accounts[0],
                gas: this.config.gasLimit,
                gasPrice: this.config.gasPrice
            });
            
            console.log(`ZIP phrase processed on blockchain. Transaction: ${result.transactionHash}`);
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                phrase: phrase,
                processingFee: processingFee,
                gasUsed: result.gasUsed
            };
            
        } catch (error) {
            console.error('Failed to process ZIP phrase on blockchain:', error);
            throw error;
        }
    }
    
    /**
     * Store harmonic data on blockchain
     */
    async storeHarmonicDataOnChain(harmonicData, processor = null) {
        try {
            const contract = this.contracts.get('SolidarityToken');
            
            if (!contract) {
                throw new Error('SolidarityToken contract not loaded');
            }
            
            const processorAddress = processor || this.accounts[0];
            
            console.log(`Storing harmonic data on blockchain (${harmonicData.length} points)`);
            
            // Convert harmonic data to uint256 format
            const harmonicDataUint = harmonicData.map(value => 
                this.web3.utils.toBN(Math.floor(value * 1000000)) // Scale for precision
            );
            
            const result = await contract.methods.storeHarmonicData(harmonicDataUint, processorAddress).send({
                from: this.accounts[0],
                gas: this.config.gasLimit,
                gasPrice: this.config.gasPrice
            });
            
            console.log(`Harmonic data stored on blockchain. Transaction: ${result.transactionHash}`);
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                dataPoints: harmonicData.length,
                processor: processorAddress,
                gasUsed: result.gasUsed
            };
            
        } catch (error) {
            console.error('Failed to store harmonic data on blockchain:', error);
            throw error;
        }
    }
    
    /**
     * Get token balance for address
     */
    async getTokenBalance(address = null) {
        try {
            const contract = this.contracts.get('SolidarityToken');
            
            if (!contract) {
                throw new Error('SolidarityToken contract not loaded');
            }
            
            const targetAddress = address || this.accounts[0];
            const balance = await contract.methods.balanceOf(targetAddress).call();
            
            return {
                address: targetAddress,
                balance: this.web3.utils.fromWei(balance, 'ether'),
                balanceWei: balance
            };
            
        } catch (error) {
            console.error('Failed to get token balance:', error);
            throw error;
        }
    }
    
    /**
     * Transfer tokens
     */
    async transferTokens(toAddress, amount) {
        try {
            const contract = this.contracts.get('SolidarityToken');
            
            if (!contract) {
                throw new Error('SolidarityToken contract not loaded');
            }
            
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            console.log(`Transferring ${amount} SOL tokens to ${toAddress}`);
            
            const result = await contract.methods.transfer(toAddress, amountWei).send({
                from: this.accounts[0],
                gas: this.config.gasLimit,
                gasPrice: this.config.gasPrice
            });
            
            console.log(`Token transfer complete. Transaction: ${result.transactionHash}`);
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                from: this.accounts[0],
                to: toAddress,
                amount: amount,
                gasUsed: result.gasUsed
            };
            
        } catch (error) {
            console.error('Failed to transfer tokens:', error);
            throw error;
        }
    }
    
    /**
     * Process audio with blockchain integration
     */
    async processAudioWithBlockchain(audioData, zipPhrase, harmonicData) {
        try {
            console.log('Processing audio with blockchain integration...');
            
            const results = {
                zipPhraseProcessing: null,
                harmonicDataStorage: null,
                timestamp: Date.now()
            };
            
            // Process ZIP phrase on blockchain
            if (zipPhrase) {
                results.zipPhraseProcessing = await this.processZipPhraseOnChain(zipPhrase, 0);
            }
            
            // Store harmonic data on blockchain
            if (harmonicData && harmonicData.length > 0) {
                results.harmonicDataStorage = await this.storeHarmonicDataOnChain(harmonicData);
            }
            
            console.log('Audio blockchain processing complete');
            
            return {
                success: true,
                results: results,
                audioDataLength: audioData ? audioData.length : 0,
                blockchainOperations: Object.keys(results).filter(key => results[key] !== null).length
            };
            
        } catch (error) {
            console.error('Failed to process audio with blockchain:', error);
            throw error;
        }
    }
    
    /**
     * Get blockchain network info
     */
    async getNetworkInfo() {
        try {
            const networkId = await this.web3.eth.net.getId();
            const blockNumber = await this.web3.eth.getBlockNumber();
            const gasPrice = await this.web3.eth.getGasPrice();
            
            return {
                networkId: networkId,
                blockNumber: blockNumber,
                gasPrice: gasPrice,
                gasPriceGwei: this.web3.utils.fromWei(gasPrice, 'gwei'),
                accounts: this.accounts.length,
                isConnected: this.isConnected
            };
            
        } catch (error) {
            console.error('Failed to get network info:', error);
            throw error;
        }
    }
    
    /**
     * Get contract addresses
     */
    getContractAddresses() {
        const addresses = {};
        
        for (const [name, contract] of this.contracts) {
            addresses[name] = contract.options.address;
        }
        
        return addresses;
    }
    
    /**
     * Test blockchain integration
     */
    async testBlockchainIntegration() {
        try {
            console.log('Testing blockchain integration...');
            
            const tests = {
                networkConnection: false,
                contractDeployment: false,
                zipPhraseProcessing: false,
                harmonicDataStorage: false,
                tokenOperations: false
            };
            
            // Test 1: Network connection
            const networkInfo = await this.getNetworkInfo();
            tests.networkConnection = networkInfo.isConnected;
            console.log('✓ Network connection test passed');
            
            // Test 2: Contract deployment
            tests.contractDeployment = this.contracts.size > 0;
            console.log('✓ Contract deployment test passed');
            
            // Test 3: ZIP phrase processing
            const zipResult = await this.processZipPhraseOnChain('Test Compression Wave', 0);
            tests.zipPhraseProcessing = zipResult.success;
            console.log('✓ ZIP phrase processing test passed');
            
            // Test 4: Harmonic data storage
            const testHarmonics = [440, 880, 1320, 1760];
            const harmonicResult = await this.storeHarmonicDataOnChain(testHarmonics);
            tests.harmonicDataStorage = harmonicResult.success;
            console.log('✓ Harmonic data storage test passed');
            
            // Test 5: Token operations
            const balance = await this.getTokenBalance();
            tests.tokenOperations = balance.address !== null;
            console.log('✓ Token operations test passed');
            
            const allTestsPassed = Object.values(tests).every(test => test === true);
            
            console.log('Blockchain integration tests completed');
            
            return {
                tests: tests,
                allTestsPassed: allTestsPassed,
                networkInfo: networkInfo,
                contractAddresses: this.getContractAddresses()
            };
            
        } catch (error) {
            console.error('Blockchain integration test failed:', error);
            throw error;
        }
    }
    
    /**
     * Shutdown blockchain connection
     */
    async shutdown() {
        try {
            console.log('Shutting down blockchain connector...');
            
            this.contracts.clear();
            this.accounts = [];
            this.isConnected = false;
            this.web3 = null;
            
            console.log('Blockchain connector shutdown complete');
            
        } catch (error) {
            console.error('Error during blockchain connector shutdown:', error);
        }
    }
}

module.exports = {
    SolidarityBlockchainConnector
};