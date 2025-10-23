// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";
import { GatewayCaller } from "fhevm/gateway/GatewayCaller.sol";

/**
 * @title PollFactorySepolia
 * @notice Sepolia + fhEVM Coprocessor 兼容版本
 * @dev 不直接调用 FHE.asEuint32(0)，而是通过前端传入加密的初始值
 */
contract PollFactorySepolia is GatewayCaller {
    struct Poll {
        uint256 id;
        string title;
        string[] options;
        address creator;
        uint256 endTime;
        bool resultsDecrypted;
        euint32[] encryptedVotes;
        uint32[] results;
        mapping(address => bool) hasVoted;
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;

    event PollCreated(uint256 indexed pollId, string title, address indexed creator, uint256 endTime);
    event VoteSubmitted(uint256 indexed pollId, address indexed voter);
    event PollDecrypted(uint256 indexed pollId, uint32[] results);

    // ------------------------------------------------------------
    // CREATE POLL
    // ------------------------------------------------------------
    /// @notice 创建新投票（使用加密的初始计数）
    /// @param _title 投票标题
    /// @param _options 投票选项
    /// @param _duration 持续时间（秒）
    /// @param _encryptedZeros 加密的 0 值数组（从前端传入）
    /// @param _inputProofs 证明数组
    function createPoll(
        string memory _title,
        string[] memory _options,
        uint256 _duration,
        einput[] calldata _encryptedZeros,
        bytes[] calldata _inputProofs
    ) external returns (uint256) {
        require(_options.length >= 2, "At least 2 options required");
        require(_options.length <= 10, "Max 10 options allowed");
        require(_duration > 0, "Duration must be positive");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_options.length == _encryptedZeros.length, "Mismatched zero array length");
        require(_options.length == _inputProofs.length, "Mismatched proofs length");

        pollCount++;
        uint256 pollId = pollCount;

        Poll storage newPoll = polls[pollId];
        newPoll.id = pollId;
        newPoll.title = _title;
        newPoll.options = _options;
        newPoll.creator = msg.sender;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.resultsDecrypted = false;

        for (uint256 i = 0; i < _options.length; i++) {
            // 🧩 从外部导入加密的 0
            euint32 zero = TFHE.asEuint32(_encryptedZeros[i], _inputProofs[i]);
            
            // 授权合约访问
            TFHE.allow(zero, address(this));
            
            newPoll.encryptedVotes.push(zero);
            newPoll.results.push(0);
        }

        emit PollCreated(pollId, _title, msg.sender, newPoll.endTime);
        return pollId;
    }

    // ------------------------------------------------------------
    // VOTING
    // ------------------------------------------------------------
    /// @notice 投票（加密）
    /// @param pollId 投票 ID
    /// @param encryptedOption 加密的选项索引
    /// @param inputProof 输入证明
    function vote(
        uint256 pollId,
        einput encryptedOption,
        bytes calldata inputProof
    ) external {
        Poll storage poll = polls[pollId];
        require(poll.id != 0, "Poll does not exist");
        require(block.timestamp < poll.endTime, "Poll ended");
        require(!poll.hasVoted[msg.sender], "Already voted");

        euint32 option = TFHE.asEuint32(encryptedOption, inputProof);
        TFHE.allow(option, address(this));

        poll.hasVoted[msg.sender] = true;

        // 更新加密计数
        for (uint256 i = 0; i < poll.options.length; i++) {
            // 检查是否匹配当前选项
            ebool isMatch = TFHE.eq(option, TFHE.asEuint32(uint32(i)));
            
            // 如果匹配则加 1，否则加 0
            euint32 increment = TFHE.select(isMatch, TFHE.asEuint32(1), TFHE.asEuint32(0));
            euint32 newCount = TFHE.add(poll.encryptedVotes[i], increment);
            
            TFHE.allow(newCount, address(this));
            poll.encryptedVotes[i] = newCount;
        }

        emit VoteSubmitted(pollId, msg.sender);
    }

    // ------------------------------------------------------------
    // DECRYPTION
    // ------------------------------------------------------------
    /// @notice 结束投票并请求解密结果（简化版本）
    /// @param pollId 投票 ID
    /// @dev 在实际生产中，应该使用 Gateway 的解密机制
    function requestDecryption(uint256 pollId) external {
        Poll storage poll = polls[pollId];
        require(poll.id != 0, "Poll does not exist");
        require(block.timestamp >= poll.endTime, "Poll not ended");
        require(msg.sender == poll.creator, "Only creator can decrypt");
        require(!poll.resultsDecrypted, "Already decrypted");

        // 注意：这是简化版本
        // 实际应用中应该使用 Gateway 的解密回调机制
        // 这里暂时标记为已请求解密
        poll.resultsDecrypted = true;
        
        // 触发事件（结果数组为空，实际解密需要 Gateway）
        uint32[] memory emptyResults = new uint32[](poll.options.length);
        emit PollDecrypted(poll.id, emptyResults);
    }

    // ------------------------------------------------------------
    // VIEW FUNCTIONS
    // ------------------------------------------------------------
    function getPollInfo(uint256 pollId) external view returns (
        uint256 id,
        string memory title,
        string[] memory options,
        address creator,
        uint256 endTime,
        bool resultsDecrypted
    ) {
        Poll storage poll = polls[pollId];
        require(poll.id != 0, "Poll does not exist");
        
        return (
            poll.id,
            poll.title,
            poll.options,
            poll.creator,
            poll.endTime,
            poll.resultsDecrypted
        );
    }

    function getResults(uint256 pollId) external view returns (uint32[] memory) {
        Poll storage poll = polls[pollId];
        require(poll.id != 0, "Poll does not exist");
        require(poll.resultsDecrypted, "Results not decrypted yet");
        
        return poll.results;
    }

    function hasVoted(uint256 pollId, address voter) external view returns (bool) {
        return polls[pollId].hasVoted[voter];
    }
}

