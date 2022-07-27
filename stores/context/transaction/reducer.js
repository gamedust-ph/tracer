export const defaultNetworkState = {
  network: '',
  chain: '', // ! default chain is ropsten for development
  isLoading: false,
  hasConfirm: false,
  isVerifying: false,
  hasVerify: false,
  isError: false,
  errorCode: '',
}

const NetworkReducer = (state, action) => {
  switch (action.type) {
    case 'SWITCH_TESTNET':
      return {
        ...state,
        network: action.payload.network
      }

    case 'SWITCH_MAINNET':
      return {
        ...state,
        network: action.payload.network
      }

    case 'SWITCH_CHAIN':
      return {
        ...state,
        chain: action.payload.chain
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading
      }

    case 'HAS_CONFIRM':
      return {
        ...state,
        hasConfirm: action.payload.hasConfirm
      }

    case 'SET_VERIFYING':
      return {
        ...state,
        isVerifying: action.payload.isVerifying
      }

    case 'HAS_VERIFY':
      return {
        ...state,
        hasVerify: action.payload.hasVerify
      }

    case "SET_ERROR": {
      return {
        ...state,
        isError: action.payload.isError,
        errorCode: action.payload.errorCode,
      }
    }

    default:
      return {
        ...state
      };
  }
}

export default NetworkReducer