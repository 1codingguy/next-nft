// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // deploy the NFTMarket, same as what was done in sample-test.js
  const MarketContract = await hre.ethers.getContractFactory("NFTMarket");
  const market = await MarketContract.deploy()
  await market.deployed();
  deployedMarketAddress = market.address

  console.log('NFTMarket deployed to:', deployedMarketAddress)
  
  // deploy the NFT contract
  const NFTContract = await hre.ethers.getContractFactory("NFT")
  const NFT = await NFTContract.deploy(deployedMarketAddress)
  await NFT.deployed()
  
  deployedNftAddress = NFT.address
  console.log('NFT deployed to:', deployedNftAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
