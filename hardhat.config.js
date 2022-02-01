require('@nomiclabs/hardhat-waffle')

const fs = require('fs')
const privateKey = fs.readFileSync('.secret').toString()

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: 'https://speedy-nodes-nyc.moralis.io/f4facbb3ad92bd0d51f79c62/polygon/mumbai', // not sure if this is the correct end point
      account: [privateKey],
    },
    mainnet: {
      url: 'https://speedy-nodes-nyc.moralis.io/f4facbb3ad92bd0d51f79c62/polygon/mainnet', // not sure if this is the correct end point
      account: [privateKey],
    },
  },
  solidity: '0.8.4',
}
