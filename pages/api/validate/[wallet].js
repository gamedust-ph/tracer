const walletValidator = require('multicoin-address-validator')

const chains = [
  {
    currency: 'etc',
    isValid: false
  },
  {
    currency: 'bnb',
    isValid: false
  },
  {
    currency: 'matic',
    isValid: false
  },
  {
    currency: 'avax',
    isValid: false
  }
]

const BSCScanHandler = async (req, res) => {
  const { wallet } = req.query

  switch (req.method) {
    case 'GET':
      const walletAddress = checkWalletValidity(wallet)
      
      if (walletAddress.length === 0) {
        res.status(404).json({ message: 'Invalid ethereum wallet address!' })
      } else {
        res.status(200).json({ message: "Wallet address is valid", wallet: walletAddress })
      }

      break;

    default:
      break;
  }
}

const checkWalletValidity = (wallet) => {
  const verifyWallet = chains.map(chain => {
    const isValid = walletValidator.validate(wallet, chain.currency, 'prod')

    return {
      currency: chain.currency,
      isValid
    }
  })

  const validity = verifyWallet.filter(currency => currency.isValid === true)

  return validity
}

export default BSCScanHandler