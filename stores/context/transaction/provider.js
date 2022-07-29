import { useState, useReducer } from "react"
import { useEffect } from "react"
import { ethers } from 'ethers'
import { TransactionContext, ethereum } from "./context"
import NetworkReducer, { defaultNetworkState } from "./reducer"

import {
  contractAbi,
  contractAddress_ropsten_testnet,
  contractAddress_polygon_testnet,
  contractAddress_binance_testnet,
  contractAddress_ethereum_mainnet,
  contractAddress_polygon_mainnet,
  contractAddress_binance_mainnet,
} from '../../../utils/constants'

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [addressToUser, setAddressToUser] = useState(null)
  // const [transactionCount, setTransactionCount] = useState(0) // TODO localStorage.getItem('transactionCount')

  const [state, dispatch] = useReducer(NetworkReducer, defaultNetworkState)

  useEffect(() => {
    // * Start of the application
    // * check if there's a wallet
    checkIfWalletIsConnected()
  }, [])

  // ? Validate wallet address every time user inputs
  useEffect(() => {
    if (addressToUser !== null) {
      const validateAddress = async () => {
        try {
          const res = await fetch(`/api/validate/${addressToUser}`)
          const data = await res.json()

          console.log(data);
        } catch (error) {
          alert(error)
        }
      }

      validateAddress()
    }
  }, [addressToUser])

  // * Form Data
  const [formData, setFormData] = useState({
    addressSendToUser: '',
    // TODO: Get Owner Contract Method
    addressToOwner: '',
    amountToUser: 0,
    amountToOwner: 0,
  })

  const changeHandler = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }))
  }

  const getEthereumContract = () => {
    let contract = null

    if (state.chain === '') {
      contract = contractAddress_ropsten_testnet // ? default contract is ropsten
    }

    if (state.network === 'testnet' && state.chain === 'ropsten') {
      contract = contractAddress_ropsten_testnet
    } else if (state.network === 'testnet' && state.chain === 'polygon') {
      contract = contractAddress_polygon_testnet
    } else if (state.network === 'testnet' && state.chain === 'binance') {
      contract = contractAddress_binance_testnet
    } else if (state.network === 'mainnet' && state.chain === 'ethereum') { // ? Main networks
      contract = contractAddress_ethereum_mainnet
    } else if (state.network === 'mainnet' && state.chain === 'polygon') {
      contract = contractAddress_polygon_mainnet
    } else if (state.network === 'mainnet' && state.chain === 'binance') {
      contract = contractAddress_binance_mainnet
    }

    console.log(`using contract ${contract} on network ${state.chain}`);

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(contract, contractAbi, signer)

    return transactionContract
  }

  // ? Connect wallet function
  // ? using Wallet Provider
  const connectWalletHandler = async () => {
    try {
      if (!ethereum) return alert('Please install Metamask')

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      // ? Set account
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.error(error);

      throw new Error('No Ethereum Object')
    }
  }

  // ? Connect wallet function
  const walletConnect = (account) => {
    setCurrentAccount(account)
  }

  // ? Check if there is a wallet connected
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert('Please install Metamask')

      // ? Get Ethereum Account
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      // ? Check if there's an account
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0])

        // getAllTransactions()
      } else {
        console.log('No Accounts Found');
      }
    } catch (error) {
      console.error(error);

      throw new Error('No Ethereum Object')
    }
  }

  // ? Send to Multiple Addresses
  const sendMultiTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install Metamask')

      // * Contract
      const contract = getEthereumContract()

      // ? Get the data from the form
      const {
        addressSendToUser,
        addressToOwner,
        amountToUser,
        amountToOwner
      } = formData

      // ? Turn inputs into arrays
      const addresses = [addressSendToUser, addressToOwner]
      const amounts = [amountToUser, amountToOwner]

      // ? Turn string amounts into numbers
      const numAmounts = amounts.map(amount => Number(amount))
      // ? Get the sum
      const totalAmount = numAmounts.reduce((curr, i) => curr + i, 0);

      // ? Turn inputted amounts into ethers hex values
      const etherAmounts = amounts.map(amount => {
        amount = ethers.utils.parseEther(amount)
        return amount._hex
      })

      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Charge To Contract
      if (state.hasConfirm === false) {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } })

        const chargeAmount = await chargeContract(contract, totalAmount)

        if (chargeAmount.message === 'failed') {
          throw new Error(chargeAmount.error.code)
        } else {
          // * The Charge method is successful and received the hash
          console.log(`Charge Txcs: ${chargeAmount}`);
          dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })
          dispatch({ type: 'HAS_CONFIRM', payload: { hasConfirm: true } })
        }
      }
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of Charge to Contract



      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Transfer amount to each address
      if (state.hasVerify === false) {
        dispatch({ type: 'SET_VERIFYING', payload: { isVerifying: true } })

        const transactHash = await transferAddresses(contract, addresses, etherAmounts)

        if (transactHash.message === 'failed') {
          throw new Error(transactHash.error.code)
        } else {
          // * Transferring amounts to the addresses has been successful
          // * and returning the hash
          console.log(`Transferred Hash: ${transactHash}`);
          dispatch({ type: 'SET_VERIFYING', payload: { isVerifying: false } })
          dispatch({ type: 'HAS_VERIFY', payload: { hasVerify: true } })

          return { status: 'success', hash: transactHash }
        }
      }
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of Transfer amount to each address
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })
      dispatch({ type: 'SET_VERIFYING', payload: { isVerifying: false } })
      dispatch(
        {
          type: 'SET_ERROR',
          payload: {
            isError: true,
            errorCode: error.message,
          }
        }
      )
      return { status: 'failed' }
    }
  }

  const chargeContract = async (contract, amount) => {
    try {
      // ? Get the total Amount and parse into ethers
      const topUpAmount = ethers.utils.parseEther(amount.toString())

      // ? Charge the smart contract with the given total Amount
      const options = { value: topUpAmount }
      const topUP = await contract.charge(options)

      await topUP.wait()

      return topUP.hash
    } catch (error) {
      return { message: 'failed', error }
    }
  }

  const transferAddresses = async (contract, addresses, amounts) => {
    try {
      const transactionHash = await contract.withdrawals(addresses, amounts)

      await transactionHash.wait()

      return transactionHash.hash
    } catch (error) {
      return { message: 'failed', error }
    }
  }

  // ? Send transaction function
  // const sendTransactionHandler = async () => {
  //   try {
  //     if (!ethereum) return alert('Please install Metamask')

  //     // ? Get the data from the form
  //     const { addressTo, amount } = formData

  //     // ? Get Ethereum Contract
  //     const contract = getEthereumContract()
  //     const parseAmount = ethers.utils.parseEther(amount)

  //     // ! Send Transaction Method on Ethereum Object
  //     await ethereum.request({
  //       method: 'eth_sendTransaction',
  //       params: [{
  //         from: currentAccount,
  //         to: addressTo,
  //         gas: '0x5208', // ? hex (21000 g/wei)
  //         value: parseAmount._hex // ? 0.0001
  //       }]
  //     })

  //     // ! Store the transaction from above to the blockchain
  //     const transactionHash = await contract.addToBlockchain(addressTo, parseAmount)

  //     setIsLoading(true)
  //     console.log(`Loading: ${transactionHash.hash}`);

  //     // ! Wait the transaction to be finished
  //     await transactionHash.wait()

  //     setIsLoading(false)
  //     console.log(`Success: ${transactionHash.hash}`);

  //     // ! Get the transaction count
  //     const tnxc_count = await contract.getTransactionCount()
  //     setTransactionCount(tnxc_count.toNumber())
  //   } catch (error) {
  //     console.error(error);

  //     throw new Error('No Ethereum Object')
  //   }
  // }

  const resetLoadingState = () => {
    dispatch({ type: 'SET_ERROR', payload: { isError: false, errorCode: '' } })
    dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })
    dispatch({ type: 'HAS_CONFIRM', payload: { hasConfirm: false } })
    dispatch({ type: 'SET_VERIFYING', payload: { isVerifying: false } })
    dispatch({ type: 'HAS_VERIFY', payload: { hasVerify: false } })
  }

  const resetError = () => {
    dispatch({ type: 'SET_ERROR', payload: { isError: false, errorCode: '' } })
  }

  const settAddressSendToUser = addressToUser => {
    setAddressToUser(addressToUser)
    // ? Set Form Data with the user's inputted address
    setFormData(currState => (
      { ...currState, addressSendToUser: addressToUser }
    ))
  }

  const changeTestnetNetwork = network => {
    dispatch({ type: 'SWITCH_TESTNET', payload: { network } })
  }

  const changeMainnetNetwork = network => {
    dispatch({ type: 'SWITCH_MAINNET', payload: { network } })
  }

  const changeChainNetwork = chain => {
    if (chain === 'eth' || chain === 'ropsten') {
      setFormData(currState => (
        { ...currState, amountToOwner: '0.0000317' }
      ))
    } else if (chain === 'binance') {
      setFormData(currState => (
        { ...currState, amountToOwner: '0.0001887' }
      ))
    } else if (chain === 'polygon') {
      setFormData(currState => (
        { ...currState, amountToOwner: '0.0552455' }
      ))
    }

    dispatch({ type: 'SWITCH_CHAIN', payload: { chain } })
  }

  // const settAddressSendToOwner = addressToOwner => setAddressToOwner(addressToOwner)

  const transactionContext = {
    // * Transaction Context
    account: currentAccount,
    addressSendToUser: addressToUser,
    network: state.network,
    changeTestnetNetwork,
    changeMainnetNetwork,
    changeChainNetwork,
    settAddressSendToUser,
    // addressSendToOwner: addressToOwner,
    // settAddressSendToOwner,
    // amount: totalAmount,
    // ! NOT USED
    connectWallet: connectWalletHandler,
    // sendTransaction: sendTransactionHandler,
    // ! USED
    walletConnect,
    sendMultiTransaction,
    isLoading: state.isLoading,
    hasConfirm: state.hasConfirm,
    isVerifying: state.isVerifying,
    hasVerify: state.hasVerify,
    isError: state.isError,
    errorCode: state.errorCode,
    chain: state.chain,
    resetError,
    resetLoadingState,
    // ! Form Handling
    formData,
    changeHandler
  }

  return (
    <TransactionContext.Provider value={transactionContext}>
      {children}
    </TransactionContext.Provider>
  )
}