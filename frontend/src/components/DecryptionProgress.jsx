/**
 * DecryptionProgress - 解密进度展示组件
 * 显示解密的实时进度和状态
 */

import React from 'react';
import { Loader, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function DecryptionProgress({ status, progress, error }) {
  
  // 状态配置
  const statusConfig = {
    idle: {
      icon: Clock,
      text: '准备解密',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    requesting: {
      icon: Loader,
      text: '提交解密请求...',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      animate: true
    },
    polling: {
      icon: Loader,
      text: 'Gateway 解密中...',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      animate: true
    },
    waiting: {
      icon: Loader,
      text: '等待链上回调...',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      animate: true
    },
    success: {
      icon: CheckCircle,
      text: '解密完成！',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    failed: {
      icon: XCircle,
      text: '解密失败',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };
  
  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;
  
  return (
    <div className={`p-6 rounded-lg ${config.bgColor} border-2 ${config.borderColor}`}>
      {/* 状态标题 */}
      <div className="flex items-center gap-3 mb-4">
        <Icon 
          className={`w-6 h-6 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
        />
        <span className={`text-lg font-semibold ${config.color}`}>
          {config.text}
        </span>
      </div>
      
      {/* 进度条 */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              status === 'success' ? 'bg-green-500' : 
              status === 'failed' ? 'bg-red-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1 text-center font-medium">
          {progress}%
        </p>
      </div>
      
      {/* 阶段说明 */}
      {status === 'requesting' && (
        <div className="text-sm text-gray-600 text-center bg-white/50 p-3 rounded">
          正在提交链上交易，请在钱包中确认...
        </div>
      )}
      
      {status === 'polling' && (
        <div className="text-sm text-gray-600 text-center bg-white/50 p-3 rounded">
          <p className="font-medium mb-1">🔐 Zama Gateway 正在解密...</p>
          <p className="text-xs">
            这是全同态加密 (FHE) 的核心步骤
            <br />
            预计需要 30-60 秒
          </p>
        </div>
      )}
      
      {status === 'waiting' && (
        <div className="text-sm text-gray-600 text-center bg-white/50 p-3 rounded">
          <p className="font-medium mb-1">⛓️ 等待智能合约回调...</p>
          <p className="text-xs">
            Gateway 已完成解密，正在将结果写入区块链
            <br />
            通常只需几秒钟
          </p>
        </div>
      )}
      
      {/* 错误信息 */}
      {error && status === 'failed' && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">错误详情：</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 成功信息 */}
      {status === 'success' && (
        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
          <p className="text-green-800 font-medium">
            ✅ 投票结果已成功解密并上链
          </p>
          <p className="text-green-700 text-sm mt-1">
            您现在可以查看完整的投票结果了
          </p>
        </div>
      )}
      
      {/* 进度提示 */}
      {status !== 'idle' && status !== 'success' && status !== 'failed' && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            ⏳ 请耐心等待，不要关闭页面
          </p>
        </div>
      )}
    </div>
  );
}

