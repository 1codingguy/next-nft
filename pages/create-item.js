import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null) // ipfs file allow user to upload
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  })

  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      // upload the file to ipfs via Moralis
      // get the url that was uploaded to, assign to `fileUrl` state variable
    } catch (error) {
      console.log(error)
    }
  }

  async function createSale() {
    // create item for sale
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
  }

}
