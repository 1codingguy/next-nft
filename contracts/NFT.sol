// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

// ERC721URIStorage inherits from ERC721
// NFT -> ERC721URIStorage -> ERC721
// That means NFT inherits from both ERC721URI storage and ERC721
contract NFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  // _tokenIds: unique ID for each token
  Counters.Counter private _tokenIds;
  // the address of the marketplace
  address contractAddress;

  constructor(address marketplaceAddress) ERC721('Metaverse Tokens', 'METT') {
    contractAddress = marketplaceAddress;
  }

  // for minting new tokens
  function createToken(string memory tokenURI) public returns (uint256) {
    // increment the _tokenIds by 1
    _tokenIds.increment();
    // gets the latest ID after incrementing
    uint256 newItemId = _tokenIds.current();
    // mint a new token with the address of the person invoking the funcion, the new minted token should have the latest ID
    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    // approve the marketplace to transate the newly minted token
    setApprovalForAll(contractAddress, true);
    return newItemId;
  }
}
