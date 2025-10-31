/**
 * RelayerClient - Gateway 解密轮询客户端
 * 基于 Zama 最佳实践
 */

const RELAYER_CONFIG = {
  sepolia: {
    url: 'https://gateway.sepolia.zama.ai/v1/public-decrypt',
    chainId: 11155111
  },
  local: {
    url: 'http://localhost:8545',
    chainId: 31337
  }
};

export class RelayerClient {
  constructor(network = 'sepolia') {
    this.config = RELAYER_CONFIG[network];
    if (!this.config) {
      throw new Error(`不支持的网络: ${network}`);
    }
  }
  
  /**
   * 轮询 Gateway 解密结果（核心功能）
   * @param {BigNumber} requestId - 解密请求ID
   * @param {string} contractAddress - 合约地址
   * @param {Object} options - 配置选项
   * @returns {Promise<Object>} 解密结果
   */
  async pollDecryption(requestId, contractAddress, options = {}) {
    const {
      maxAttempts = 60,      // 最多尝试 60 次（5分钟）
      interval = 5000,       // 每 5 秒一次
      onProgress = null      // 进度回调函数
    } = options;
    
    console.log('🔐 开始轮询 Gateway 解密...', {
      requestId: requestId.toString(),
      contractAddress,
      maxAttempts,
      estimatedTime: `${(maxAttempts * interval) / 1000}秒`
    });
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // 调用进度回调
        if (onProgress) {
          onProgress({
            current: attempt,
            total: maxAttempts,
            percentage: Math.round((attempt / maxAttempts) * 100)
          });
        }
        
        // 将 BigNumber 转换为十六进制字符串
        let handleHex;
        if (requestId.toHexString) {
          handleHex = requestId.toHexString();
        } else if (typeof requestId === 'bigint') {
          handleHex = '0x' + requestId.toString(16);
        } else {
          handleHex = '0x' + requestId.toString(16);
        }
        
        // 请求 Gateway
        const response = await fetch(this.config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            handle: handleHex,
            contractAddress: contractAddress,
            chainId: this.config.chainId
          })
        });
        
        // 成功获取解密结果
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Gateway 解密完成（第 ${attempt}/${maxAttempts} 次尝试）`, data);
          return {
            success: true,
            data,
            attempts: attempt
          };
        }
        
        // 404 表示还未准备好
        if (response.status === 404) {
          console.log(`⏳ 尝试 ${attempt}/${maxAttempts}：解密尚未完成...`);
        } else {
          console.warn(`⚠️ Gateway 返回异常状态: ${response.status}`);
          const errorText = await response.text();
          console.warn('错误详情:', errorText);
        }
        
      } catch (error) {
        console.warn(`⚠️ 轮询尝试 ${attempt}/${maxAttempts} 失败:`, error.message);
      }
      
      // 等待下一次尝试
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    // 超时
    throw new Error(
      `Gateway 解密超时（已尝试 ${maxAttempts} 次，共 ${(maxAttempts * interval) / 1000}秒）`
    );
  }
  
  /**
   * 检查 Gateway 健康状态
   * @returns {Promise<boolean>} 是否健康
   */
  async checkHealth() {
    try {
      const baseUrl = this.config.url.replace('/v1/public-decrypt', '');
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log('✅ Gateway 健康检查通过');
        return true;
      }
      
      console.warn('⚠️ Gateway 健康检查失败: HTTP', response.status);
      return false;
    } catch (error) {
      console.warn('⚠️ Gateway 健康检查失败:', error.message);
      return false;
    }
  }
}

export default RelayerClient;


