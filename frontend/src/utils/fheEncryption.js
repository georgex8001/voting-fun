/**
 * FHE Encryption Utilities
 * 前端加密工具函数（符合手册第3.5节标准）
 * 
 * 核心功能：
 * - createEncryptedZeros() - 创建加密的零值（用于初始化投票计数）
 * - createEncryptedOptionIndex() - 创建加密的选项索引（用于投票）
 */

import { createEncryptedInput } from '@zama-fhe/relayer-sdk';
import { CONTRACT_ADDRESSES } from '../config/contracts';

/**
 * ✅ 核心功能：创建加密的零值数组
 * 用于初始化投票计数（每个选项的初始计数为0）
 * 
 * @param {string} contractAddress - 合约地址
 * @param {string} signerAddress - 签名者地址（用户钱包地址）
 * @param {number} count - 需要创建的零值数量（通常等于选项数量）
 * @returns {Promise<{encryptedInputs: string[], inputProofs: string[]}>}
 */
export async function createEncryptedZeros(
  contractAddress,
  signerAddress,
  count
) {
  const encryptedInputs = [];
  const inputProofs = [];

  console.log('🔐 开始加密零值...', {
    count,
    signerAddress,
    contractAddress
  });

  // 为每个选项创建加密的零值
  for (let i = 0; i < count; i++) {
    try {
      console.log(`📝 加密零值 ${i + 1}/${count}...`);

      // ⚠️ 步骤 1: 创建加密上下文
      const input = createEncryptedInput(
        contractAddress,
        signerAddress
      );

      // ⚠️ 步骤 2: 添加 0 值（32位无符号整数）
      input.add32(0n);  // 使用 add32 因为投票计数通常用 uint32

      // ⚠️ 步骤 3: 加密并生成证明
      const { handles, inputProof } = await input.encrypt();

      // ⚠️ 步骤 4: 验证结果
      if (!handles || handles.length === 0) {
        throw new Error(`加密失败: 零值 ${i + 1} 未返回 handles`);
      }

      if (!inputProof) {
        throw new Error(`加密失败: 零值 ${i + 1} 未返回证明`);
      }

      // ⚠️ 步骤 5: 存储加密句柄和证明
      encryptedInputs.push(handles[0]);  // einput
      inputProofs.push(inputProof);       // bytes (attestation)

      console.log(`✅ 零值 ${i + 1} 加密成功`);
    } catch (error) {
      console.error(`❌ 零值 ${i + 1} 加密失败:`, error);
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  console.log('✅ 所有零值加密完成', {
    count: encryptedInputs.length
  });

  // ✅ 确保长度一致
  if (encryptedInputs.length !== inputProofs.length) {
    throw new Error('加密输入和证明长度不匹配');
  }

  if (encryptedInputs.length !== count) {
    throw new Error('加密输入数量和所需数量不匹配');
  }

  return {
    encryptedInputs,  // string[] - einput 数组
    inputProofs       // string[] - bytes 数组
  };
}

/**
 * ✅ 核心功能：创建加密的选项索引
 * 用于投票时加密选择的选项索引
 * 
 * @param {string} contractAddress - 合约地址
 * @param {string} signerAddress - 签名者地址（用户钱包地址）
 * @param {number} optionIndex - 选项索引（0, 1, 2, ...）
 * @returns {Promise<{encryptedInput: string, inputProof: string}>}
 */
export async function createEncryptedOptionIndex(
  contractAddress,
  signerAddress,
  optionIndex
) {
  console.log('🔐 开始加密选项索引...', {
    optionIndex,
    signerAddress,
    contractAddress
  });

  try {
    // ⚠️ 步骤 1: 创建加密上下文
    const input = createEncryptedInput(
      contractAddress,
      signerAddress
    );

    // ⚠️ 步骤 2: 添加选项索引（32位无符号整数）
    input.add32(BigInt(optionIndex));

    // ⚠️ 步骤 3: 加密并生成证明
    const { handles, inputProof } = await input.encrypt();

    // ⚠️ 步骤 4: 验证结果
    if (!handles || handles.length === 0) {
      throw new Error('加密失败: 选项索引未返回 handles');
    }

    if (!inputProof) {
      throw new Error('加密失败: 选项索引未返回证明');
    }

    console.log(`✅ 选项索引 ${optionIndex} 加密成功`);

    return {
      encryptedInput: handles[0],  // einput
      inputProof                    // bytes (attestation)
    };
  } catch (error) {
    console.error(`❌ 选项索引加密失败:`, error);
    throw new Error(`加密失败: ${error.message}`);
  }
}

/**
 * 批量创建加密选项索引（如果需要）
 * 
 * @param {string} contractAddress - 合约地址
 * @param {string} signerAddress - 签名者地址
 * @param {number[]} optionIndices - 选项索引数组
 * @returns {Promise<{encryptedInputs: string[], inputProofs: string[]}>}
 */
export async function createEncryptedOptionIndices(
  contractAddress,
  signerAddress,
  optionIndices
) {
  const encryptedInputs = [];
  const inputProofs = [];

  for (let i = 0; i < optionIndices.length; i++) {
    const { encryptedInput, inputProof } = await createEncryptedOptionIndex(
      contractAddress,
      signerAddress,
      optionIndices[i]
    );
    encryptedInputs.push(encryptedInput);
    inputProofs.push(inputProof);
  }

  return { encryptedInputs, inputProofs };
}

export default {
  createEncryptedZeros,
  createEncryptedOptionIndex,
  createEncryptedOptionIndices
};

