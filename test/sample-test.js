const { expect } = require('chai')

describe('NFTMarket', function () {
  let market // an instance of the market contract
  let NFT // an instance of the NFT contract
  let deployedMarketAddress
  let deployedNFTContractAddress
  let listingPrice
  let auctionPrice

  it('should create and deploy the marketplace', async () => {
    // deploy the marketplace
    // get a reference to the market contract
    const MarketContract = await ethers.getContractFactory('NFTMarket')
    market = await MarketContract.deploy()
    // wait until the contract finished being deployed
    await market.deployed()
    // get a reference to the address of where it is deployed
    deployedMarketAddress = market.address

    console.log(`deployedMarketAddress is ${deployedMarketAddress}`)
  })

  it('should deploy the NFT contract', async () => {
    // deploy the NFT contract
    const NFTContract = await ethers.getContractFactory('NFT')
    NFT = await NFTContract.deploy(deployedMarketAddress)
    await NFT.deployed()
    deployedNFTContractAddress = NFT.address

    console.log(`deployedNFTContractAddress is ${deployedNFTContractAddress}`)
  })

  it('should retrieve the marketplace listing price', async () => {
    listingPrice = await market.getListingPrice()
    // why is it necessary to convert the listingPrice to a string?
    listingPrice = listingPrice.toString()

    console.log(`listingPrice is ${listingPrice}`)
  })

  it('should parse the auctionPrice and create two tokens', async () => {
    auctionPrice = ethers.utils.parseUnits('100', 'ether')
    // create token, interact with NFT contract
    await NFT.createToken('https://www.mytokenlocation.com')
    await NFT.createToken('https://www.mytokenlocation2.com')
  })

  it('should create 2 items in the marketplace', async () => {
    // create items in the marketplace
    await market.createMarketItem(deployedNFTContractAddress, 1, auctionPrice, {
      value: listingPrice,
    })
    await market.createMarketItem(deployedNFTContractAddress, 2, auctionPrice, {
      value: listingPrice,
    })
  })

  it('should generate test accounts for local testing env', async () => {
    // use the buyer's address to connect to the market
    const [_, buyerAddress] = await ethers.getSigners()
    // execute sale of token to another user (tokenId == 1)
    await market
      .connect(buyerAddress)
      .createMarketSale(deployedNFTContractAddress, 1, { value: auctionPrice })
  })

  it('should query and return the unsold items', async () => {
    // there should be only one unsold item with tokenId == 2
    let unsoldItems = await market.fetchMarketItems()

    unsoldItems = await Promise.all(
      unsoldItems.map(async i => {
        // tokenURI() method from IERC721 interface
        // calling the NFT contract
        const tokenURI = await NFT.tokenURI(i.tokenId)
        let item = {
          price: i.price.toString(), // turning Big number into string
          tokenId: i.tokenId.toString(), // turning Big number into string
          seller: i.seller,
          owner: i.owner,
          tokenURI,
        }
        return item
      })
    )

    console.log('unsold items:', unsoldItems)
  })
})
