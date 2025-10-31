/**
 * useDecryption Hook - 完整的解密流程管理
 * 包含：提交请求 → 轮询 Gateway → 等待回调 → 获取结果
 */

import { useState, useCallback } from 'react';
import RelayerClient from '../utils/relayerClient';

export function useDecryption(contract) {
  const [status, setStatus] = useState('idle'); // idle, requesting, polling, waiting, success, failed
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const relayerClient = new RelayerClient('sepolia');
  
  /**
   * 完整的解密请求流程
   * @param {number} pollId - 投票ID
   * @returns {Promise<Object>} 解密结果
   */
  const requestDecryption = useCallback(async (pollId) => {
    try {
      setStatus('requesting');
      setProgress(0);
      setError(null);
      setResult(null);
      
      console.log('🎮 开始解密投票:', pollId);
      
      // ===== Step 1: 提交链上解密请求 =====
      setProgress(10);
      console.log('📝 提交链上解密请求...');
      
      const tx = await contract.requestDecryption(pollId);
      console.log('📤 交易已提交:', tx.hash);
      
      setProgress(20);
      const receipt = await tx.wait();
      console.log('✅ 交易已确认');
      
      // ===== Step 2: 从事件中获取 requestId =====
      setProgress(30);
      console.log('🔍 查找 DecryptionRequested 事件...');
      
      // 查找事件（兼容不同版本的 ethers.js）
      let requestId = null;
      
      // ethers v6
      if (receipt.logs) {
        const iface = contract.interface;
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'DecryptionRequested') {
              requestId = parsed.args.requestId;
              console.log('✅ 找到 requestId (v6):', requestId.toString());
              break;
            }
          } catch (e) {
            // 跳过无法解析的日志
          }
        }
      }
      
      // ethers v5 (备用)
      if (!requestId && receipt.events) {
        const event = receipt.events.find(e => e.event === 'DecryptionRequested');
        if (event) {
          requestId = event.args.requestId;
          console.log('✅ 找到 requestId (v5):', requestId.toString());
        }
      }
      
      if (!requestId) {
        throw new Error('未找到 DecryptionRequested 事件，请检查合约是否正确部署');
      }
      
      // ===== Step 3: 轮询 Gateway（关键步骤）=====
      setStatus('polling');
      setProgress(40);
      console.log('⏳ 开始轮询 Gateway 解密...');
      
      try {
        await relayerClient.pollDecryption(
          requestId,
          contract.target || contract.address, // 兼容 ethers v5/v6
          {
            maxAttempts: 60,  // 5 分钟
            interval: 5000,   // 5 秒
            onProgress: (pollProgress) => {
              // 40-80% 分配给轮询阶段
              const percentage = 40 + (pollProgress.percentage * 0.4);
              setProgress(Math.round(percentage));
              console.log(`轮询进度: ${pollProgress.current}/${pollProgress.total}`);
            }
          }
        );
        
        console.log('✅ Gateway 解密完成');
      } catch (gatewayError) {
        console.warn('⚠️ Gateway 轮询超时，但回调可能仍会执行');
        console.warn('错误详情:', gatewayError.message);
        // 不要立即失败，继续等待链上回调
      }
      
      // ===== Step 4: 等待链上回调完成 =====
      setStatus('waiting');
      setProgress(85);
      console.log('⏳ 等待链上回调完成...');
      
      await waitForCallbackCompletion(contract, pollId, (waitProgress) => {
        const percentage = 85 + (waitProgress * 0.10);
        setProgress(Math.round(percentage));
      });
      
      // ===== Step 5: 获取最终结果 =====
      setProgress(95);
      console.log('📊 获取投票结果...');
      
      const pollInfo = await contract.getPollInfo(pollId);
      
      // 检查是否已解密
      const resultsDecrypted = pollInfo.resultsDecrypted || pollInfo[6]; // 兼容不同返回格式
      
      if (!resultsDecrypted) {
        throw new Error('解密未完成，请稍后重试');
      }
      
      // 获取解密后的结果
      const results = await contract.getResults(pollId);
      
      const decryptionResult = {
        pollId,
        results: results.map(r => Number(r)),
        resultsDecrypted: true
      };
      
      setProgress(100);
      setStatus('success');
      setResult(decryptionResult);
      
      console.log('🎉 解密流程完成!', decryptionResult);
      
      return decryptionResult;
      
    } catch (err) {
      console.error('❌ 解密失败:', err);
      setStatus('failed');
      setError(err.message || '解密失败，请重试');
      throw err;
    }
  }, [contract]);
  
  /**
   * 等待链上回调完成
   */
  const waitForCallbackCompletion = async (contract, pollId, onProgress) => {
    const MAX_WAIT = 120; // 2分钟（120次 * 1秒）
    const INTERVAL = 1000; // 1秒
    
    console.log('⏳ 等待链上回调（最多 2 分钟）...');
    
    for (let i = 0; i < MAX_WAIT; i++) {
      onProgress(i / MAX_WAIT);
      
      try {
        const pollInfo = await contract.getPollInfo(pollId);
        const resultsDecrypted = pollInfo.resultsDecrypted || pollInfo[6];
        
        if (resultsDecrypted) {
          console.log('✅ 回调已在链上完成');
          return;
        }
      } catch (err) {
        console.warn('⚠️ 查询投票状态失败:', err.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
    
    throw new Error('等待回调超时 - 请检查合约状态或稍后重试');
  };
  
  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);
  
  return {
    requestDecryption,
    status,
    progress,
    error,
    result,
    reset
  };
}

export default useDecryption;


