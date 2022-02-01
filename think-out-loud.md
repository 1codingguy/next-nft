`npx tailwind init -p` creates two files:
1. tailwind.config.js
2. postcss.config.js

`create-next-app` comes with `globals.css` in styles folder
- replace everything with:
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- this gives up a setup to use different classNames

`npx hardhat` create Solidity development environment, have all the stuff we need:

configure hardhat to work with polygon

RPC endpoint, what is RPC?
https://docs.polygon.technology/docs/develop/network-details/network
- will be using both polygon-mainnet and mumbai-testnet
- if trying to deploy our contract to one of these nets, might fail because there's too much traffic going on
- use infura instead
- but infura requires registration with credit card
- look into using Moralis instead

When we are in local test network we don't need to define an account, because hardhat automatically inject and use an account for us unless we define one

# create a .secret file
- what's the difference to .env file?