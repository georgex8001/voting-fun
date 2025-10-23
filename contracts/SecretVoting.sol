// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title SecretVoting
 * @notice 基于 Zama FHEVM 的保密投票系统
 * @dev 使用全同态加密技术保护投票隐私
 */
contract SecretVoting is GatewayCaller {
    // 投票状态枚举
    enum PollStatus {
        Active,    // 进行中
        Ended      // 已结束
    }

    // 投票结构体
    struct Poll {
        uint256 id;                    // 投票ID
        string title;                  // 投票标题
        string[] options;              // 投票选项
        address creator;               // 创建者
        uint256 endTime;              // 结束时间
        PollStatus status;            // 投票状态
        mapping(address => bool) hasVoted;  // 记录是否已投票
        euint32[] encryptedVotes;     // 加密的投票计数
        uint32[] results;             // 解密后的结果
        bool resultsDecrypted;        // 是否已解密
    }

    // 状态变量
    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    
    // 事件
    event PollCreated(
        uint256 indexed pollId,
        string title,
        address indexed creator,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed pollId,
        address indexed voter
    );
    
    event PollEnded(
        uint256 indexed pollId
    );
    
    event ResultsDecrypted(
        uint256 indexed pollId,
        uint32[] results
    );

    /**
     * @notice 创建新投票
     * @param _title 投票标题
     * @param _options 投票选项数组
     * @param _duration 投票持续时间（秒）
     */
    function createPoll(
        string memory _title,
        string[] memory _options,
        uint256 _duration
    ) external returns (uint256) {
        require(_options.length >= 2, "At least 2 options required");
        require(_options.length <= 10, "Maximum 10 options allowed");
        require(_duration > 0, "Duration must be positive");
        require(bytes(_title).length > 0, "Title cannot be empty");

        pollCount++;
        uint256 pollId = pollCount;
        
        Poll storage newPoll = polls[pollId];
        newPoll.id = pollId;
        newPoll.title = _title;
        newPoll.options = _options;
        newPoll.creator = msg.sender;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.status = PollStatus.Active;
        newPoll.resultsDecrypted = false;

        // 初始化每个选项的加密投票计数为0
        for (uint256 i = 0; i < _options.length; i++) {
            euint32 initialCount = TFHE.asEuint32(0);
            TFHE.allow(initialCount, address(this));  // 授权合约访问
            newPoll.encryptedVotes.push(initialCount);
            newPoll.results.push(0);
        }

        emit PollCreated(pollId, _title, msg.sender, newPoll.endTime);
        
        return pollId;
    }

    /**
     * @notice 投票（加密）
     * @param _pollId 投票ID
     * @param _encryptedOptionIndex 加密的选项索引
     */
    function vote(uint256 _pollId, einput _encryptedOptionIndex, bytes calldata inputProof) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(poll.status == PollStatus.Active, "Poll is not active");
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");

        // 将加密输入转换为euint32
        euint32 optionIndex = TFHE.asEuint32(_encryptedOptionIndex, inputProof);
        
        // 标记已投票
        poll.hasVoted[msg.sender] = true;

        // 为每个选项增加加密投票计数
        for (uint256 i = 0; i < poll.options.length; i++) {
            // 检查投票的选项索引是否等于当前索引
            ebool isMatch = TFHE.eq(optionIndex, TFHE.asEuint32(uint32(i)));
            
            // 如果匹配，增加计数（加密加法）
            euint32 increment = TFHE.select(isMatch, TFHE.asEuint32(1), TFHE.asEuint32(0));
            euint32 newCount = TFHE.add(poll.encryptedVotes[i], increment);
            TFHE.allow(newCount, address(this));  // 授权合约访问新的加密值
            poll.encryptedVotes[i] = newCount;
        }

        emit VoteCast(_pollId, msg.sender);
    }

    /**
     * @notice 结束投票
     * @param _pollId 投票ID
     */
    function endPoll(uint256 _pollId) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(poll.status == PollStatus.Active, "Poll already ended");
        require(
            block.timestamp >= poll.endTime || msg.sender == poll.creator,
            "Only creator can end poll early"
        );

        poll.status = PollStatus.Ended;

        emit PollEnded(_pollId);
    }

    /**
     * @notice 请求解密投票结果
     * @param _pollId 投票ID
     */
    function requestDecryption(uint256 _pollId) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(poll.status == PollStatus.Ended, "Poll must be ended");
        require(!poll.resultsDecrypted, "Results already decrypted");

        // 请求解密所有选项的投票计数
        uint256[] memory cts = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            cts[i] = Gateway.toUint256(poll.encryptedVotes[i]);
        }

        // 发送解密请求到 Gateway
        Gateway.requestDecryption(
            cts,
            this.callbackDecryption.selector,
            0,
            block.timestamp + 100,
            false
        );
    }

    /**
     * @notice Gateway 回调函数，接收解密结果
     * @param decryptedInput 解密后的投票计数
     */
    function callbackDecryption(
        uint256 /*requestId*/,
        uint256[] memory decryptedInput
    ) public onlyGateway {
        // 注意：这个回调需要额外的逻辑来确定是哪个投票的结果
        // 在生产环境中，应该使用 requestId 映射来追踪
        
        // 简化版本：假设最后一个活跃的投票
        Poll storage poll = polls[pollCount];
        
        if (!poll.resultsDecrypted && poll.status == PollStatus.Ended) {
            for (uint256 i = 0; i < decryptedInput.length && i < poll.results.length; i++) {
                poll.results[i] = uint32(decryptedInput[i]);
            }
            poll.resultsDecrypted = true;

            emit ResultsDecrypted(poll.id, poll.results);
        }
    }

    /**
     * @notice 获取投票信息
     * @param _pollId 投票ID
     */
    function getPollInfo(uint256 _pollId) external view returns (
        uint256 id,
        string memory title,
        string[] memory options,
        address creator,
        uint256 endTime,
        PollStatus status,
        bool resultsDecrypted
    ) {
        Poll storage poll = polls[_pollId];
        require(poll.id != 0, "Poll does not exist");
        
        return (
            poll.id,
            poll.title,
            poll.options,
            poll.creator,
            poll.endTime,
            poll.status,
            poll.resultsDecrypted
        );
    }

    /**
     * @notice 获取投票结果（仅在解密后）
     * @param _pollId 投票ID
     */
    function getResults(uint256 _pollId) external view returns (uint32[] memory) {
        Poll storage poll = polls[_pollId];
        require(poll.id != 0, "Poll does not exist");
        require(poll.resultsDecrypted, "Results not yet decrypted");
        
        return poll.results;
    }

    /**
     * @notice 检查用户是否已投票
     * @param _pollId 投票ID
     * @param _voter 投票者地址
     */
    function hasVoted(uint256 _pollId, address _voter) external view returns (bool) {
        return polls[_pollId].hasVoted[_voter];
    }

    /**
     * @notice 获取所有投票ID列表
     */
    function getAllPollIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](pollCount);
        for (uint256 i = 1; i <= pollCount; i++) {
            ids[i - 1] = i;
        }
        return ids;
    }
}


