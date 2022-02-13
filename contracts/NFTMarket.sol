// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  // For each individual market item that's created
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  // owner of the contract
  address payable owner;
  // listing fee that the marketplace charges
  uint256 listingPrice = 0.025 ether;

  constructor() {
    // Payable constructor can receive Ether
    owner = payable(msg.sender);
  }

  // an object representing each individual market item
  struct MarketItem {
    uint256 itemId;
    address nftContract; // the contract address
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold; // if an item is sold
  }

  // keep up with the item being created
  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  // for front end, to get the listing price
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  // place an item for sale in the marketplace
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, 'Price must be at least 1 wei');
    require(msg.value == listingPrice, 'Price must be equal to listing');

    _itemIds.increment();
    uint256 itemId = _itemIds.current();

    idToMarketItem[itemId] = MarketItem(
      itemId, // itemId from the marketplace
      nftContract,
      tokenId, // tokenId from NFT contract?
      payable(msg.sender),
      payable(address(0)), // buyer is 0, means no buyer yet
      price,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0), // buyer is 0, instead of the marketplace
      price,
      false
    );
  }

  function createMarketSale(address nftcontract, uint256 itemId)
    public
    payable
    nonReentrant
  {
    uint256 price = idToMarketItem[itemId].price;
    uint256 tokenId = idToMarketItem[itemId].tokenId;

    require(
      msg.value == price,
      'Please submit the asking price to complete the transaction'
    );

    // transfer the amount to seller
    idToMarketItem[itemId].seller.transfer(msg.value);
    // transfer the token ownership from marketplace to the buyer
    IERC721(nftcontract).transferFrom(address(this), msg.sender, tokenId);
    // after transfer complete, update the owner of the token
    idToMarketItem[itemId].owner = payable(msg.sender);
    // mark the token as sold
    idToMarketItem[itemId].sold = true;
    // increse the number of total item sold by 1
    _itemsSold.increment();
    // pay the owner of the contract
    payable(owner).transfer(listingPrice);
  }

  // return the unsoldItem, better name would be `fetchUnsoldItems`
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _itemIds.current();
    uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint256 currentIndex = 0; // index of the unsoldItems array

    // init an array with the lenght matching the number of unsold items
    MarketItem[] memory unsoldItems = new MarketItem[](unsoldItemCount);

    for (uint256 i = 0; i <= itemCount; i++) {
      // unsold items have a zero address in owner attribute
      // if init i=1, then no need to +1 here
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint256 currentId = i + 1;
        // insert the unsold item into unsoldItems array
        // didn't follow tutorial to create an intermediate variable
        unsoldItems[currentIndex] = idToMarketItem[currentId];
        // increment the index, current index already populated
        currentIndex++;
      }
    }

    return unsoldItems;
  }
}
