import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111 in hex

export function useWallet() {
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    checkConnection()
    setupListeners()
  }, [])

  useEffect(() => {
    setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID)
  }, [chainId])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }

        const currentChainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        })
        setChainId(currentChainId)
      } catch (error) {
        console.error('检查连接失败:', error)
      }
    }
  }

  const setupListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null)
      toast.error('钱包已断开连接')
    } else if (accounts[0] !== account) {
      setAccount(accounts[0])
      toast.success('账户已切换')
    }
  }

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId)
    window.location.reload()
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('请安装 MetaMask!')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
      
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      })
      setChainId(currentChainId)

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          })
        } catch (switchError) {
          if (switchError.code === 4902) {
            toast.error('请手动添加 Sepolia 测试网')
          }
        }
      }

      toast.success('钱包连接成功!')
    } catch (error) {
      console.error('连接钱包失败:', error)
      toast.error('连接钱包失败')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    toast.success('钱包已断开')
  }

  return {
    account,
    chainId,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet
  }
}


