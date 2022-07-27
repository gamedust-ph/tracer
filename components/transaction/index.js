import { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { Button, Paper } from '@material-ui/core'
import React from 'react'
import classes from './index.module.css'
import { TransactionContext } from '../../stores/context/transaction/context'
import Loader from '../modal/Loader'
import { mainnets, testnets } from '../../utils/constants'
import Steps from '../steps'
import { RefreshIcon } from '@heroicons/react/outline'
import { CheckIcon } from '@heroicons/react/solid'

const ButtonIcon = ({ crypto }) => {
  if (crypto === '') crypto = 'unknown'

  return (
    <div className="-ml-0.5 mr-2">
      <Image src={`/wallets/${crypto}-logo.svg`} width={17} height={17} aria-hidden="true" alt={`${crypto} wallet`} />
    </div>
  )
}

const Transaction = () => {
  const transactionCtx = useContext(TransactionContext)
  const {
    changeHandler,
    formData,
    sendMultiTransaction,
    addressSendToUser,
    network,
    changeChainNetwork,
    chain,
    hasConfirm,
    hasVerify
  } = transactionCtx

  const [transactHash, setTransactHash] = useState('')
  const [amountToUser, setAmountToUser] = useState(formData.amountToUser)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const chainId = window.ethereum.networkVersion
    const formattedChain = `0x${Number(chainId).toString(16)}`

    if (network === 'testnet') {
      if (formattedChain === testnets.ropsten.chainId) { // ? Ropsten
        changeChainNetwork('ropsten')
      } else if (formattedChain === testnets.polygon.chainId) { // ? Polygon
        changeChainNetwork('polygon')
      } else if (formattedChain === testnets.binance.chainId) { // ? Binance
        changeChainNetwork('binance')
      }
    } else if (network === 'mainnet') {
      if (formattedChain === mainnets.ethereum.chainId) { // ? Ethereum
        changeChainNetwork('ethereum')
      } else if (formattedChain === mainnets.polygon.chainId) { // ? Polygon
        changeChainNetwork('polygon')
      } else if (formattedChain === mainnets.binance.chainId) { // ? Binance
        changeChainNetwork('binance')
      }
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    window.ethereum.on('chainChanged', networkChanged)
    return () => {
      window.ethereum.removeListener('chainChanged', networkChanged)
    }
    // eslint-disable-next-line
  }, [network])

  const onAmountChange = e => {
    setAmountToUser(e.target.value)
    changeHandler(e)
  }

  const networkChanged = (chainId) => {
    // ? Testnets
    if (network === 'testnet') {
      if (chainId === testnets.ropsten.chainId) { // ? Ropsten
        changeChainNetwork('ropsten')
      } else if (chainId === testnets.polygon.chainId) { // ? Polygon
        changeChainNetwork('polygon')
      } else if (chainId === testnets.binance.chainId) { // ? Binance
        changeChainNetwork('binance')
      }
    } else if (network === 'mainnet') {
      if (chainId === mainnets.ethereum.chainId) { // ? Ethereum
        changeChainNetwork('ethereum')
      } else if (chainId === mainnets.polygon.chainId) { // ? Polygon
        changeChainNetwork('polygon')
      } else if (chainId === mainnets.binance.chainId) { // ? Binance
        changeChainNetwork('binance')
      }
    }
  }

  const changeNetworkHandler = async (network) => {
    await changeNetwork({ chainNetwork: network })
  }

  const changeNetwork = async ({ chainNetwork }) => {
    try {
      if (!window.ethereum) throw new Error('No Crypto Wallet Found')

      let params = []

      if (network === 'testnet') {
        params = [
          // ! Change between testnets and mainnets
          { ...testnets[chainNetwork] }
        ]
      } else if (network === 'mainnet') {
        params = [
          // ! Change between testnets and mainnets
          { ...mainnets[chainNetwork] }
        ]
      }

      if (chainNetwork === 'ropsten') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [
            { chainId: `0x${Number(3).toString(16)}` }
          ]
        })
      } else if (chainNetwork === 'ethereum') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [
            { chainId: `0x${Number(1).toString(16)}` }
          ]
        })
      } else {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params
        })
      }
    } catch (error) {
      console.error(error);
    }
  }

  const emptyTransactionHashHandler = () => {
    setTransactHash('')
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    const {
      addressSendToUser,
      addressToOwner,
      amountToUser,
      amountToOwner
    } = formData

    // ? return nothing, leave this function
    // ? not submit anything
    if (!addressSendToUser || !addressToOwner || !amountToUser || !amountToOwner) return

    const transactionHash = await sendMultiTransaction()

    console.log(transactionHash);

    if (transactionHash.status === 'success') {
      setStep(currState => currState + 1)
      setAmountToUser('')

      if (network === 'testnet') {
        if (chain === 'ropsten') { // ? Ropsten
          console.log(`${network} ${chain}`);
          setTransactHash(`${testnets.ropsten.blockExplorerUrls}tx/${transactionHash}`)
        } else if (chain === 'polygon') { // ? Polygon
          console.log(`${network} ${chain}`);
          setTransactHash(`${testnets.polygon.blockExplorerUrls}tx/${transactionHash}`)
        } else if (chain === 'binance') { // ? Binance
          console.log(`${network} ${chain}`);
          setTransactHash(`${testnets.binance.blockExplorerUrls}tx/${transactionHash}`)
        }
      } else if (network === 'mainnet') {
        if (chain === 'ethereum') { // ? Ropsten
          console.log(`${network} ${chain}`);
          setTransactHash(`${mainnets.ethereum.blockExplorerUrls}tx/${transactionHash}`)
        } else if (chain === 'polygon') { // ? Polygon
          console.log(`${network} ${chain}`);
          setTransactHash(`${mainnets.polygon.blockExplorerUrls}tx/${transactionHash}`)
        } else if (chain === 'binance') { // ? Binance
          console.log(`${network} ${chain}`);
          setTransactHash(`${mainnets.binance.blockExplorerUrls}tx/${transactionHash}`)
        }
      }
    }
  }

  const retryAgainHandler = () => {
    setStep(1)
  }

  return (
    <Paper elevation={1} className={classes.disclosure}>
      <Loader transactionHash={transactHash} onEmptyTransactHash={emptyTransactionHashHandler} />
      <Steps currentStep={step} />
      <div className="">
        {step === 3 ? (
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h1 className="text-lg leading-6 font-medium text-gray-900">
                    Payment Successful
                  </h1>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Do you want to make another transaction?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                  onClick={() => retryAgainHandler()}
                >
                  <RefreshIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submitHandler}>
            <input
              type="text"
              name="addressToOwner"
              onChange={(e) => changeHandler(e)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm lg:text-base border-gray-300 rounded-md disabled:bg-gray-200"
              placeholder="Enter wallet address to send"
              required
              disabled={hasConfirm}
            />

            <input
              type="number"
              name="amountToOwner"
              step="0.0000001"
              value={formData.amountToOwner}
              onChange={(e) => changeHandler(e)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm lg:text-base border-gray-300 rounded-md my-4 disabled:bg-gray-200"
              placeholder="Enter ethereum amount"
              // required
              disabled
            />

            <input
              type="number"
              name="amountToUser"
              step="0.0000001"
              value={amountToUser}
              onChange={(e) => onAmountChange(e)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm lg:text-base border-gray-300 rounded-md my-4 disabled:bg-gray-200"
              placeholder="Enter amount to send"
              disabled={hasConfirm}
            />

            <div className="flex justify-evenly">
              <Button
                variant="outlined"
                color="primary"
                className='mt-4'
                startIcon={<ButtonIcon crypto={'binance'} />}
                onClick={() => changeNetworkHandler('binance')}
                disabled={chain === 'binance'}
              >
                {network === 'testnet' ? 'Binance Testnet' : 'Binance'}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                className='mt-4'
                startIcon={<ButtonIcon crypto={'ethereum'} />}
                onClick={network === 'testnet' ? () => changeNetworkHandler('ropsten') : () => changeNetworkHandler('ethereum')}
                disabled={chain === 'ropsten' || chain === 'ethereum'}
              >
                {network === 'testnet' ? 'Ropsten' : 'Ethereum'}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                className='mt-4'
                startIcon={<ButtonIcon crypto={'polygon'} />}
                onClick={() => changeNetworkHandler('polygon')}
                disabled={chain === 'polygon'}
              >
                {network === 'testnet' ? 'Polygon Testnet' : 'Polygon'}
              </Button>
            </div>

            {/* <Button
              variant="outlined"
              color="primary"
              className='mt-4'
              startIcon={<ButtonIcon crypto={''} />}
              onClick={() => changeNetworkHandler('rsk')}
              disabled
            >
              {network === 'testnet' ? 'RSK Testnet' : 'RSK Mainnet'}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              className='mt-4'
              startIcon={<ButtonIcon crypto={'fantom'} />}
              onClick={() => changeNetworkHandler('fantom')}
              disabled
            >
              {network === 'testnet' ? 'Fantom Testnet' : 'Fantom'}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              className='mt-4'
              startIcon={<ButtonIcon crypto={'avalanche'} />}
              onClick={() => changeNetworkHandler('avalanche')}
              disabled
            >
              {network === 'testnet' ? 'Avalanche Testnet' : 'Avalanche'}
            </Button> */}

            {!hasConfirm && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="contained"
                  size='medium'
                  color="primary"
                  type="submit"
                  className='mt-4 h-12'
                >
                  {step === 1 && `Pre-Send ${chain}`}
                  {step === 2 && `Send ${chain}`}
                </Button>
              </div>
            )}

            {hasConfirm && !hasVerify && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="contained"
                  size='medium'
                  color="primary"
                  type="submit"
                  className='mt-4 h-12'
                >
                  Verify
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </Paper>
  )
}

export default Transaction