## project dependencies:
- `npm install ethers hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/
hardhat-ethers web3modal @openzeppelin/contracts ipfs-http-client axios`
## dev dependencies:
- `npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`

## init configuration for tailwind:
`npx tailwind init -p` creates two files:
1. tailwind.config.js
2. postcss.config.js

### `create-next-app` comes with `globals.css` in styles folder
- replace everything with:
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- this gets a setup to use different classNames from tailwind

## `npx hardhat` create Solidity development environment, have all the stuff we need:
- no need to create contract folder and do all the configuration ourselves
- after running `npx hardhard`, `hardhat.config.js` file is created under the root directory

## Next step: configure hardhat to work with polygon
- Working with Polygon, need to decide if we want to interact with public RPC endpoint, or our private RPC endpoint.
- this documentation page shows the network details for mainnet and mumbai testnet
https://docs.polygon.technology/docs/develop/network-details/network
- There are public RPC endpoint, but "Public RPCs may have traffic or rate-limits depending on usage."
- will be using both polygon-mainnet and mumbai-testnet
- if trying to deploy our contract to one of these nets, might fail because there's too much traffic going on
- use infura instead
- but infura requires registration with credit card
- So sign up on Moralis to get a dedicated free RPC URL.

### RPC endpoint, what is RPC?
- "RPC endpoint: A network-specific address of a server process for remote procedure calls (RPCs). "

### About `accounts` in `hardhat.config.js`
- When we are in local test network we don't need to define an account, because hardhat test environment automatically inject and use an account for us unless we define one.
- there are an array of accounts (20) that are created for you in a local network
- but when deployed to a real net there has to be some type of payment
- typically you are going to be using the private key from the address that you would like to deploy from, which should be kept secret all the time, most of the time in an .env file.

## create a .secret file
- what's the difference to .env file?
- use `fs.readFileSync()` to read the private key defined in .secret file

## Start writing Solidity contracts
### about the libraries imported
- ERC721URIStorage is inherited from ERC721 itself
  - gives us extra setTokenURI
- Counter utils for incrementing numbers

## `Using ... for` in Solidity
https://docs.soliditylang.org/en/v0.8.11/contracts.html#using-for
- But still not fully understand how it workds now

## variables in global scope within NFT contract
- `_tokenIds` keep track of unique identifier for each token
contractAddress - address of the marketplace that we want to allow NFT to interact with
- `contractAddress` is the address of the marketplace, that we want to allow the NFT to be able to interact with or vice versa. 
  - We want to be able to give the NFT marketplace the ability to transact these tokens or change the ownership of these tokens from a separated contract, the way we do that is to call `setApprovalForAll()`, and we are going to be passing in the value of the contract address which we are going to be setting in our `constructor()`.

## Explaining what variables get stored
- only `tokenURI` gets passed into `createToken()`, because:
  - `marketplaceAddress` is already stored when `constructor()` fires
  - `_tokenIds` is in the global scope of the smart contract.
  - we also know who is the person invoking this `createToken()` because it's a transaction, `msg.sender` provides the address of the person initiating the transaction.

- That means a new token needs these two things too, but since they are stored in the global scope of the smart contract, all the token has access to these too.

## inside `createToken()`

### `_tokenIds`
- it is of type `Counters.Counter`.
- `Counters` is the library imported from openzeppelin
  - which has several methods, including `increment()`, `current()`

### `_mint()` is an internal function from ERC721

### `_setTokenURI()` also from ERC721
- in principle I understand when minting a token, it's necessary to link up the tokenId with the metadata (tokenURI), but where does the mapping get stored?

### `setApprovalForAll()`
- to give the marketplace an approval to transact this token between the users, from within another contract.  

### why returning `newItemId`?
- To interact with the smart contract from a client application, we are typically mint a token and set it for sell in a subsequent transaction, and to put it for sell we need to know the ID of the token. That's why we need to return the ID here to get ahold of it on the client. 

