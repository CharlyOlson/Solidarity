/**
 * Simple contract validation for Solidarity Smart Contracts
 * This validates that our Solidity contracts implement the security fix correctly
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 */

import fs from 'fs';
import path from 'path';

class ContractValidator {
    constructor() {
        this.contractsDir = '/home/runner/work/Solidarity/Solidarity/contracts';
        this.validationResults = [];
    }

    /**
     * Validate that contracts use secure encoding practices
     */
    validateSecureEncoding() {
        console.log('🔍 Validating secure encoding practices...');
        
        const contractFiles = fs.readdirSync(this.contractsDir)
            .filter(file => file.endsWith('.sol'));
        
        for (const file of contractFiles) {
            const filePath = path.join(this.contractsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            console.log(`\n📄 Checking ${file}:`);
            
            // Check for vulnerable abi.encodePacked usage (excluding comments)
            const lines = content.split('\n');
            let vulnerableCount = 0;
            let commentVulnerableCount = 0;
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
                    // This is a comment line
                    if (trimmed.includes('keccak256') && trimmed.includes('abi.encodePacked')) {
                        commentVulnerableCount++;
                    }
                } else {
                    // This is actual code
                    if (line.includes('keccak256') && line.includes('abi.encodePacked')) {
                        vulnerableCount++;
                    }
                }
            }
            
            // Check for secure abi.encode usage
            const securePattern = /keccak256\s*\(\s*abi\.encode\s*\(/g;
            const secureMatches = content.match(securePattern);
            
            // Check for educational/demo purposes (allowed vulnerable code)
            const isDemo = file.includes('Demo') || content.includes('educational purposes');
            
            if (vulnerableCount > 0 && !isDemo) {
                console.log(`   ❌ Found vulnerable abi.encodePacked usage in code: ${vulnerableCount} instances`);
                this.validationResults.push({
                    file,
                    status: 'VULNERABLE',
                    issue: 'Uses abi.encodePacked for hash generation'
                });
            } else if (vulnerableCount > 0 && isDemo) {
                console.log(`   ℹ️  Demo contract with ${vulnerableCount} educational vulnerable examples`);
                this.validationResults.push({
                    file,
                    status: 'DEMO',
                    issue: 'Educational examples of vulnerable code'
                });
            } else if (commentVulnerableCount > 0) {
                console.log(`   📝 Contains ${commentVulnerableCount} examples of vulnerable code in comments (educational)`);
            }
            
            if (secureMatches) {
                console.log(`   ✅ Found secure abi.encode usage: ${secureMatches.length} instances`);
                if (vulnerableCount === 0 || isDemo) {
                    this.validationResults.push({
                        file,
                        status: 'SECURE',
                        issue: null
                    });
                }
            }
            
            // Record secure contracts that don't have vulnerable code in actual implementation
            if (vulnerableCount === 0 && !isDemo && secureMatches) {
                this.validationResults.push({
                    file,
                    status: 'SECURE',
                    issue: null
                });
            }
            
            // Check for proper comments about security
            if (content.includes('SECURITY FIX') || content.includes('SECURE:')) {
                console.log(`   📝 Contains security documentation`);
            }
            
            // Check for proper license
            if (content.includes('SPDX-License-Identifier')) {
                console.log(`   📄 Contains proper license identifier`);
            }
        }
    }

    /**
     * Validate contract structure and best practices
     */
    validateContractStructure() {
        console.log('\n🏗️  Validating contract structure...');
        
        const contractFiles = fs.readdirSync(this.contractsDir)
            .filter(file => file.endsWith('.sol'));
        
        for (const file of contractFiles) {
            const filePath = path.join(this.contractsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            console.log(`\n📄 Checking structure of ${file}:`);
            
            // Check for proper pragma version
            if (content.includes('pragma solidity ^0.8')) {
                console.log(`   ✅ Modern Solidity version`);
            }
            
            // Check for proper error handling
            if (content.includes('require(') || content.includes('revert')) {
                console.log(`   ✅ Contains error handling`);
            }
            
            // Check for events
            if (content.includes('event ')) {
                console.log(`   ✅ Defines events`);
            }
            
            // Check for author attribution
            if (content.includes('Scott Charles Olson') && content.includes('Charles H. Dykes')) {
                console.log(`   ✅ Proper author attribution`);
            }
        }
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n📊 Security Validation Report');
        console.log('=' .repeat(50));
        
        const secureContracts = this.validationResults.filter(r => r.status === 'SECURE').length;
        const vulnerableContracts = this.validationResults.filter(r => r.status === 'VULNERABLE').length;
        const demoContracts = this.validationResults.filter(r => r.status === 'DEMO').length;
        
        console.log(`✅ Secure contracts: ${secureContracts}`);
        console.log(`❌ Vulnerable contracts: ${vulnerableContracts}`);
        console.log(`ℹ️  Demo contracts: ${demoContracts}`);
        
        const overallStatus = vulnerableContracts === 0 ? 'SECURE' : 'NEEDS_ATTENTION';
        console.log(`\n🎯 Overall Status: ${overallStatus}`);
        
        if (overallStatus === 'SECURE') {
            console.log('🎉 All production contracts use secure encoding practices!');
        } else {
            console.log('⚠️  Some contracts need security fixes.');
        }
        
        return {
            secure: secureContracts,
            vulnerable: vulnerableContracts,
            demo: demoContracts,
            overallStatus
        };
    }

    /**
     * Run complete validation
     */
    validate() {
        console.log('🔐 Solidarity Smart Contract Security Validation');
        console.log('=' .repeat(60));
        
        this.validateSecureEncoding();
        this.validateContractStructure();
        return this.generateReport();
    }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new ContractValidator();
    const results = validator.validate();
    
    // Exit with error code if there are vulnerable contracts
    process.exit(results.vulnerable > 0 ? 1 : 0);
}

export default ContractValidator;