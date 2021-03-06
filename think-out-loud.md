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

## work on `NFTMarket.sol`
- importing `ReentrancyGuard`, security control
- need this for any functions that talk to another contract
- NFTMarket inherits from `ReentrancyGuard`

## global variables in NFTMarket

Why need to keep up with the number of items sold?
- when working with arrays in Solidity, cannot have dynamic linked array, so you need to know the link of the array.
- few of the arrays we are going to work with:
  - the number of items I've bought myself
  - the number of items I've created myself
  - the number of items that are currently not sold
- we need the numbers because we are going to return those values

### Reason to determine who's the owner of the contract
- the owner makes a commission on the item sold

# Before continuing, read the related blog post to get an OVERVIEW of the project
- I had the feeling that I was coding something without understanding why when I was simply coding along without understanding the forest

### listingPrice in `ether` even deploying to Polygon
- Matic and Ether both have 18 decimal point

### owner of NFTMarketplace = msg.sender
- it means owner of this contract is the person deploying it, which will be the contract address that we deploy this with 

- What's the difference between itemId and tokenId? I guess: 
  - `itemId` is the ID for each item in the marketplace
  - `tokenId` refers to the minted token?

`idToMarketItem` mapping, why id is in `uint256`? `_itemIds` is of type `Counters.Counter`

### event
- event is a function call because it's defined with `()`? And separating the arguments inside the call uses `,`.
- defining a `struct` uses `{}`, like object, separating each item inside the struct definition uses `;`, just like JS object.
- emit an event when a market item is created. A way to listen to this event from a front end application. 
- what's the `indexed` keyword for when defining event?
  - The indexed parameters for logged events will allow you to search for these events using the indexed parameters as filters.
  - The indexed keyword is only relevant to logged events.
  - Up to three parameters can receive the attribute indexed which will cause the respective arguments to be searched for: It is possible to filter for specific values of indexed arguments in the user interface.
  - https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do


## Examining what's actually done in createToken()

### Explanation on `using Counters for Counters.Counter`
- `Counters` is a library, `Counter` is a struct data type inside `Counters` library.
- when we say using A for B. it means that attach every function from library A to type B.
- so when you say using `Counters for Counters.Counter` it means that assign all the functions inside `Counters` library like `current()` or `increment()` to the `Counter` struct.
- libraries are an efficient way to reduce gas fees. because they are deployed only once at a specific address with its code being reused by various contracts.
- https://ethereum.stackexchange.com/questions/97186/what-is-the-reason-behind-writing-using-counters-for-counters-counters-when-us/116726#116726?newreg=bff2a399d1a14d9eb2371a3f3aa5670a

### what does _mint() in ERC721 actually do?
- check the target address is not a zero address
- check if the token to mint doesn't exist yet by checking `tokenID`
- call `_beforeTokenTransfer()` hook (which can be not doing anything)
  - "in the case of the _beforeTokenTransfer hook, you can execute functionality before the token is transferred."
  - https://forum.openzeppelin.com/t/how-to-use-beforetokentransfer-when-extending-erc721presetminterpauserautoid-contract/3505/2
  - in the source code `_beforeTokenTransfer()` is marked as a virtual function.
    - "Base functions can be overridden by inheriting contracts to change their behavior if they are marked as virtual."
    - https://ethereum.stackexchange.com/questions/78572/what-are-the-virtual-and-override-keywords-in-solidity
    - "You could restrict transfer (other than minting) to only registered candidates, you could mint another token to signify that the original holder has voted, you could prevent transfer outside of specific voting times, you could emit a vote event."
    - "if you don???t need to use hooks, then you don???t need to include the function in your child contract."
  - register one more token under the new owner's address by increment the target address total token count by 1: `_balances[to] += 1;`
    -  `_balances` is a mapping of "address" to "token count", which means it tracks what address (who) owns how many tokens in total
  - To register the minted token under new owner's address: `_owners[tokenId] = to;`
    - `_owners` is a mapping from token ID to owner address
  - both `_balances` and `_owners` mappings are defined inside ERC721 contract.

### what does _setTokenURI() in ERC721URIStorage do?
- check if the token we are going to mint actually exist
  - by calling `_exists()` from `ERC721.sol`
  - recall `ERC721URIStorage` inherits from `ERC721`
- registering the newly minted token should point to which URI.
  - `_tokenURIs` is a mapping inside ERC721URIStorage``, registering which token (tokenID) has what URI info/ address


### what does `setApprovalForAll()` do?
- `setApprovalForAll()` is from ERC721
- calls `_setApprovalForAll()` internal function.
- allows the marketplace (the operator) to operate on all of owner's token

---

# Continue NFTMarket.sol

2 functions to interact with contract
1. createMarketItem
2. createMarketSale

### Transfer NFT (token) from the person who minted the NFT (token) to the marketplace
- transfer the ownership of the NFT to the contract itself (marketplace)
- right now the person that is writing the transaction owns this, we want to transfer ownership to this contract (marketplace), then transfer the owneship to the new buyer
- But why need to call IERC721, passing `nftContract` as an argument?


### Point of confusion for me right now:
`_itemIds` in `NFTMarket.sol`
`_tokenIds` in `NFT.sol`
a market item is an NFT, which is a token, then why need to keep two IDs?

NFT is a contract that creates new NFT token, NFTMarketplace is the marketplace to mint/ transact token?

Different functions to view our NFTs, functions that:
- return all the unsold items
- only the items I've purchased
- return all the items I've created


to create an array of specific length:
`MarketItem[] memory items = new MarketItem[](unsoldItemCount);`

LHS: type location varName
RHA: newKeyword type lengthOfArray

### fetchMyNFTs()
how to create a dynamic array?
- I thought I need to create a dynamic array because the total number of NFTs created is unknown at this point.
- But what the author does is to
  1. loop over the entire collection, get the total number of array owned by `msg.sender`
  2. then init a fixed length array with that number and populate that new array

- there should be a way to stop the for loop going on if the last position at myNFTS[] is already filled - i.e. means the last NFT minted by me was found, so no further looping is required

Is it possible to refactor these three functions:
- `fetchMarketItems()`
- `fetchMyNfts()`
- `fetchItemsCreated()`

All these functions are so similar to each other, the only difference is what variable to look for in each `MarketItem`.
- is it because it's Solidity so things are done differently again?

## Writing test with hardhat
- In the constructor of the actual NFT market, we need to pass in the market address (of where it is deployed)

`ethers.utils.parseUnits()`
- allows us to work with this whole unit as supposed to work with wei which is 18 decimals


So creating:
- a new NFT token 
- a new market item in the marketplace
is a totally separated process?

In writing test, first need to create a token by passing the tokenURI.
Then in a separated function call, calling createMarketItem(), and manually assigning a tokenId to each item? I thought it was supposed to be incrementing by itself

note that in the call of createMarketItem:
`await market.createMarketItem(deployedNFTContractAddress, 1, auctionPrice, {value: listingPrice})`
- the last argument `{value: listingPrice}` is not found in the definition
- but I guess it's referring to `msg.value`, that is the amount sent with the transaction. So that means this argument is passed in an object at the last place of function call in solidity?


Up until this point, we have created different transactions. How to get different address form different users theoretically:
- In real use case, users will be using MetaMask or some wallet to interact with the contract from some address
- But in a test env, we can get reference to a bunch of test accounts - when running a hardhat node, 20 local accounts are given to work with 

`await Promise.all()`
- allows us to do an async mapping
  - repurpose the value of these items
  - set these items to be the result of this map, map over all of them.

## work on front end, _app.js

- As per official Next.js doc, _app.js is "To override the default App, create the file ./pages/_app.js "

tailwind class meaning
`border-b` - border-bottom-width: 1px;

Instead of checking each class and its meaning one by one, input those classes in the html file, then go to the browser dev too to see what each class does.
- That saves a lot of time looking up on the documentation
- The goal now is not to master Tailwind, just to experience how it is with the tutorial. NO NEED to remember everything.

## work on index.js
- Web3Modal is a way for us to connect to someone's Ethereum wallet.

When we deploy our project, need to have a reference to address of our marketplace and nft
- init variables in config.js
- once we deployed, have these values in the variables -> import those vars in index.js

- what we are doing in index.js now:
1. get the address of the contract
2. get the abi
recall that in order to interact with deployed contracts on chain, we need both address and abi.

### `artifacts` folder in root
- those compiled contracts are saved under this folder
- `npx hardhat compile` will compile and save the compiled json files in this folder.
- `npx hardhat test` will do the same, compile first then run the tests in the `test` folder

`nft` state variable
- when the app loads, `nft` is empty, then we are going to call the smart contract, update the local state.

`loadNFTs()`
- in a read operation we don't need to know anything about the user, so we can use a very generic provider `JsonRpcProvider()`
  - "The JSON-RPC API is a popular method for interacting with Ethereum"
  - "https://docs.ethers.io/v5/api/providers/jsonrpc-provider/"
- What is a provider:
  - "A Provider in ethers is a read-only abstraction to access the blockchain data."
  - https://docs.ethers.io/v5/api/providers/provider/#:~:text=A%20Provider%20in%20ethers%20is,Coming%20from%20Web3.&text=The%20ethers%20library%20creates%20a,of%20a%20Signer%2C%20which%20Web3.


Form my understanding now:
- provider is the means to access data on blockchain
- address to point to where in blockchain
- what about abi? provide a compiled json file of what the contract looks like?


- look for the instance of the Ethereum that is being injected into the web browser.
- if the user is connected, then we will have a connection to work with
- create a provider with that user's address (from the connection)
  - use `web3Provider` instead of `JsonRpcProvider` as in `loadNFTs()`
  - what's the difference between these providers?
- since we are writing an actual transaction, we need user's address and we need them to sign and execute an actual transaction
- to do that we have to create a signer
- after that, when we get a reference to the contract, instead of passing the basic provider as the 3rd argument, we are passing in the signer instead.

## running a local node and deploy locally
- `npx hardhat node` gives a list of accounts to test scripts locally
- `npx hardhat run scripts/deploy.js --network localhost` runs the deploy script with the local generated node
- then copy the address of both NFTMarket and NFT, paste them into config.js

### re-run deploy.js next day, error:
- came from copying nft deployed address as `nftmarketaddress`


### detour for IPFS server related setting with Moralis
- tutorial works with Infura, but I work with Moralis, needs to figure out how to upload to IPFS using Moralis
- replacing this with something from Moralis
`const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')`
- an url we can use to set and pin items to ipfs

the `try...catch` block, understand what it does first
`client.add` 
- add a file or directory to IPFS
- the progress bit is optional 

so the purpose of all these is that to upload a file onto IPFS via Infura/ Moralis, then get the url that was loaded to and set to the state variable. Let's see how to do it with Moralis

On top of the example video from Moralis:
Moralis.initialize() - arg: application id from moralis.io
Moralis.serverURL() - arg: server url from moralis.io

in the `upload()`
```
const file = new Moralis.File("fileName", "actualFileData")
await file.saveIPFS()
console.log(file.hash())
console.log(file.ipfs())
```

it seems `file.ipfs()` returns the url that was uploaded to?

Tutorial from Moralis to refer to:
https://moralis.io/full-guide-how-to-upload-to-ipfs/
- is it a must to login and logout?
- it seems the login function from Moralis is to connect the user to MetaMask wallet? Then in this sense it's the same as using web3modal in the tutorial?

So now, Infura or Moralis are doing these things:
- deploy to a Mumbai test net
- upload to ipfs client
- 
### my guess of what's going on with this block of code:
```
    1. const web3modal = new Web3Modal()
    2. const connection = await web3modal.connect()
    3. const provider = new ethers.providers.Web3Provider(connection)
    4. const signer = provider.getSigner()
```

- web3modal is to connect to Ethereum wallet, line 1 create an instance of the web3modal object
- line 2 is to wait for the user to connect to web3modal object?
- line 3 is to confirm which one is the wallet provider - MataMask or something else?
- line 4 is to get the address of the person who signs in with the wallet - hence `signer`

### Connecting accounts with MetaMask, still don't know exactly how to do 

## Instead of trying to use endpoint from Moralis, try to use Mainnet or Ropsten instead
- since there's more Eth in Ropsten, try using Ropsten first to test