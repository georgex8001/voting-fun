/**
 * Safe Contract Call Utility
 * 安全的合约调用工具（符合手册第6节标准）
 * 
 * 解决钱包兼容性问题：
 * - OKX 钱包弹窗不出现
 * - 交易确认超时
 * - eth_call 超时
 * - BigInt 解析错误
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from '../config/contracts';
import { getRpcUrl } from '../config/network';

// 备用 RPC 列表（符合手册标准）
const FALLBACK_RPCS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
  'https://eth-sepolia.public.blastapi.io',
  'https://rpc.ankr.com/eth_sepolia'
];

/**
 * 安全的合约读取（使用公共 RPC）
 * 符合手册第6.4节：所有读操作使用公共 RPC
 */
export async function safeContractRead(
  contractAddress,
  functionName,
  args = [],
  options = {}
) {
  const { 
    abi = CONTRACT_ABI,
    useFallbackRpc = true
  } = options;

  // 创建公共 RPC provider（不依赖钱包）
  const rpcUrl = getRpcUrl();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    console.log(`📖 读取合约: ${functionName}(${args.join(', ')})`);
    const result = await contract[functionName](...args);
    
    // ✅ BigInt 安全转换
    return safeBigIntConversion(result);
  } catch (error) {
    if (!useFallbackRpc) {
      throw error;
    }

    // 尝试备用 RPC
    for (const fallbackRpc of FALLBACK_RPCS) {
      if (fallbackRpc === rpcUrl) continue; // 跳过已尝试的
    
      try {
        console.log(`🔄 尝试备用 RPC: ${fallbackRpc}`);
        const fallbackProvider = new ethers.JsonRpcProvider(fallbackRpc);
        const fallbackContract = new ethers.Contract(contractAddress, abi, fallbackProvider);
        const result = await fallbackContract[functionName](...args);
        console.log('✅ 备用 RPC 调用成功');
        return safeBigIntConversion(result);
      } catch (e) {
        console.warn(`❌ RPC 失败: ${fallbackRpc}`, e.message);
      }
    }

    throw new Error(`所有 RPC 调用均失败: ${error.message}`);
  }
}

/**
 * 安全的合约写入（OKX 钱包兼容）
 * 符合手册第6.2节：使用 window.ethereum.request
 */
export async function safeContractWrite(
  contractAddress,
  functionName,
  args = [],
  options = {}
) {
  const {
    abi = CONTRACT_ABI,
    from = null,
    value = '0x0'
  } = options;

  if (!window.ethereum) {
    throw new Error('No wallet provider found');
  }

  try {
    // 1. 获取签名者地址
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const fromAddress = from || await signer.getAddress();

    // 2. 创建合约接口
    const iface = new ethers.Interface(abi);
    
    // 3. 手动编码函数调用数据
    const data = iface.encodeFunctionData(functionName, args);
    
    console.log(`✍️ 写入合约: ${functionName}(${args.join(', ')})`);
    console.log(`📍 From: ${fromAddress}`);
    console.log(`📍 To: ${contractAddress}`);

    // 4. ✅ 使用 window.ethereum.request 发送交易（OKX 兼容）
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: fromAddress,        // ✅ 必须显式指定
        to: contractAddress,      // 合约地址
        data: data,               // 编码后的函数调用
        value: value              // 交易金额（如果需要）
      }]
    });

    console.log('✅ Transaction sent:', txHash);

    // 5. ✅ 使用公共 RPC 等待确认（符合手册第6.3节）
    const receipt = await waitForTransactionWithPublicRpc(txHash);

    return {
      hash: txHash,
      receipt
    };
  } catch (error) {
    console.error('❌ 合约写入失败:', error);
    throw error;
  }
}

/**
 * 使用公共 RPC 轮询交易确认（符合手册第6.3节）
 */
export async function waitForTransactionWithPublicRpc(
  txHash, 
  maxAttempts = 60,
  interval = 2000
) {
  console.log('⏳ 等待交易确认...');

  // 创建公共 RPC provider
  const rpcUrl = getRpcUrl();
  let provider = new ethers.JsonRpcProvider(rpcUrl);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt && receipt.blockNumber) {
        console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
        return receipt;
      }
    } catch (error) {
      console.warn(`⚠️ 轮询尝试 ${i + 1} 失败:`, error.message);
      
      // 如果主要 RPC 失败，尝试备用 RPC
      if (i % 5 === 0 && i > 0) {
        for (const fallbackRpc of FALLBACK_RPCS) {
          if (fallbackRpc === rpcUrl) continue;
          try {
            provider = new ethers.JsonRpcProvider(fallbackRpc);
            const receipt = await provider.getTransactionReceipt(txHash);
            if (receipt && receipt.blockNumber) {
              console.log(`✅ Transaction confirmed via fallback RPC!`);
              return receipt;
            }
          } catch (e) {
            // 继续尝试下一个
          }
        }
      }
    }
    
    // 每 2 秒轮询一次
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Transaction confirmation timeout after ${maxAttempts * interval / 1000} seconds`);
}

/**
 * 安全的 BigInt 转换（符合手册第6.5节）
 */
export function safeBigIntConversion(value) {
  // 如果是数组或对象，递归处理
  if (Array.isArray(value)) {
    return value.map(item => safeBigIntConversion(item));
  }

  if (value && typeof value === 'object') {
    const converted = {};
    for (const [key, val] of Object.entries(value)) {
      converted[key] = safeBigIntConversion(val);
    }
    return converted;
  }

  // ✅ 先转字符串，再转数字（避免精度丢失）
  if (typeof value === 'bigint' || (value && value._isBigNumber)) {
    const str = value.toString();
    // 检查是否超出 Number 安全范围
    if (str.length > 15) {
      return str; // 返回字符串以保持精度
    }
    return Number(str);
  }

  return value;
}

/**
 * 创建读取合约实例（使用公共 RPC）
 */
export function createReadContract(contractAddress, abi = CONTRACT_ABI) {
  const rpcUrl = getRpcUrl();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(contractAddress, abi, provider);
}

/**
 * 创建写入合约实例（使用钱包 signer）
 */
export async function createWriteContract(contractAddress, abi = CONTRACT_ABI) {
  if (!window.ethereum) {
    throw new Error('No wallet provider found');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, abi, signer);
}

export default {
  safeContractRead,
  safeContractWrite,
  waitForTransactionWithPublicRpc,
  safeBigIntConversion,
  createReadContract,
  createWriteContract
};
