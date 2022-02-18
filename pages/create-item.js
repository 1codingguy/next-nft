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
    // get the user input file from the form, it's not a url I reckon?
    const file = e.target.files[0]
    try {
      // upload the file to ipfs via Moralis
      // get the url that was uploaded to, assign to `fileUrl` state variable
    } catch (error) {
      console.log(error)
    }
  }

  async function createItem() {
    // allow user to create an item and save it to ipfs
    const { price, name, description } = formInput
    // guard clause against any empty value of the followings
    if (!price || !name || !description || !fileUrl) return
    // stringify the data into ipfs json format
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    })
    try {
      // save `data` to ipfs
      // see how to do it on moralis
      // then call createSale()
      // createSale(url)
    } catch (error) {
      console.log(error)
    }
  }

  async function createSale(url) {
    // listing an item for sale on the marketplace
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    // to interact with NFT contract
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    // access `createToken` method of the NFT contract to create the token
    let transaction = await contract.createToken(url)
    // tx stands for transaction? wait for the transaction to go through?
    // why need both await keyword and wait() here?
    let tx = await transaction.wait()

    // get the tokenId returned from the above transaction, modify returned values
    // tx.events is the returned value, it's an array it seems.
    let event = tx.events[0]
    let value = event.args[2]
    // turn a "big number" in to a number
    let tokenId = value.toNumber()

    // reference to the selling price of the item
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    // reference to the NFTMarket contract instead, replace previous ref in `contract`
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    // turn the listing price into string
    listingPrice = listingPrice.toString()
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className='flex justify-center'>
      <div className='w-1/2 flex flex-col pb-12'>
        <input
          placeholder='Asset Name'
          className='mt-8 border rounded p-4'
          onChange={e =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder='Asset Description'
          className='mt-2 border rounded p-4'
          onChange={e =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder='Asset Price in Eth'
          className='mt-2 border rounded p-4'
          onChange={e =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type='file' name='Asset' className='my-4' onChange={onChange} />
        {fileUrl && <img className='rounded mt-4' width='350' src={fileUrl} />}
        <button
          onClick={createItem}
          className='font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg'
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  )
}
