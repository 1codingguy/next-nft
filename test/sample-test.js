const { expect } = require('chai')

describe('NFTMarket', function () {
  it('should create and execute market sales', async () => {
    // deploy the marketplace
    // get a reference to the market contract
    const MarketContract = await ethers.getContractFactory('NFTMarket')
    const market = await MarketContract.deploy()
    // wait until the contract finished being deployed
    await market.deployed()
    // get a reference to the address of where it is deployed
    const deployedMarketAddress = market.address

    // deploy the NFT contract
    const NFTContract = await ethers.getContractFactory('NFT')
    const NFT = await NFTContract.deploy(deployedMarketAddress)
    await NFT.deployed()
    const deployedNFTContractAddress = NFT.address

    let listingPrice = await market.getListingPrice()
    // why is it necessary to convert the listingPrice to a string?
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('100', 'ether')

    // create token, interact with NFT contract
    await NFT.createToken('https://www.mytokenlocation.com')
    await NFT.createToken('https://www.mytokenlocation2.com')

    // create items in the marketplace
    await market.createMarketItem(deployedNFTContractAddress, 1, auctionPrice, {
      value: listingPrice,
    })
    await market.createMarketItem(deployedNFTContractAddress, 2, auctionPrice, {
      value: listingPrice,
    })

    // generate test accounts for local testing env
    const [_, buyerAddress] = await ethers.getSigners()
    // use the buyer's address to connect to the market
    await market
      .connect(buyerAddress)
      .createMarketSale(deployedNFTContractAddress, 1, { value: auctionPrice })

    // querying the marketItems
    const unsoldItems = await market.fetchMarketItems()
    console.log('unsold items:', items)
  })
})
