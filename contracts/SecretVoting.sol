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
    // ✅ 完整的状态枚举（符合手册标准）
    enum PollStatus {
        Active,           // 进行中
        Ended,            // 已结束（等待解密）
        PendingDecrypt,   // 等待解密
        Completed,        // 已完成（已解密）
        Expired           // 已过期
    }

    // ✅ 解密请求追踪结构（增强版）
    struct DecryptionRequest {
        uint256 pollId;        // 关联的投票ID
        address requester;     // 请求者地址
        uint256 timestamp;     // 请求时间
        uint8 retryCount;      // ✅ 重试次数
        bool processed;        // 是否已处理
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

    // 配置常量
    uint256 public constant CALLBACK_GAS_LIMIT = 500000;  // Gateway 回调 Gas 限制
    uint256 public constant DECRYPTION_TIMEOUT = 1800;    // 解密超时时间（30分钟，1800秒）
    uint8 public constant MAX_RETRIES = 3;               // ✅ 最大重试次数
    
    // 状态变量
    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    
    // ✅ 新增：解密请求追踪映射
    mapping(uint256 => DecryptionRequest) public decryptionRequests;  // requestId => 请求信息
    mapping(uint256 => uint256) public pollToRequestId;               // pollId => requestId
    
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
    
    // ✅ 解密请求事件
    event DecryptionRequested(
        uint256 indexed requestId,
        uint256 indexed pollId,
        uint256 timestamp
    );
    
    // ✅ 新增：解密重试事件
    event DecryptionRetrying(
        uint256 indexed requestId,
        uint256 indexed pollId,
        uint8 retryCount
    );
    
    // ✅ 新增：投票过期事件
    event PollExpired(
        uint256 indexed pollId,
        uint256 timestamp
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
     * @return requestId 解密请求ID
     */
    function requestDecryption(uint256 _pollId) external returns (uint256 requestId) {
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
        requestId = Gateway.requestDecryption(
            cts,
            this.callbackDecryption.selector,
            CALLBACK_GAS_LIMIT,          // ✅ 修复：使用足够的 Gas
            block.timestamp + DECRYPTION_TIMEOUT,  // ✅ 修复：30分钟超时
            false
        );
        
        // ✅ 记录解密请求映射
        decryptionRequests[requestId] = DecryptionRequest({
            pollId: _pollId,
            requester: msg.sender,
            timestamp: block.timestamp,
            retryCount: 0,
            processed: false
        });
        
        pollToRequestId[_pollId] = requestId;
        
        // ✅ 更新状态为等待解密
        poll.status = PollStatus.PendingDecrypt;
        
        emit DecryptionRequested(requestId, _pollId, block.timestamp);
    }

    /**
     * @notice Gateway 回调函数，接收解密结果
     * @param requestId 解密请求ID
     * @param decryptedInput 解密后的投票计数
     */
    function callbackDecryption(
        uint256 requestId,
        uint256[] memory decryptedInput
    ) public onlyGateway {
        // ✅ 修复：使用 requestId 映射来追踪投票
        DecryptionRequest storage request = decryptionRequests[requestId];
        
        // 验证请求有效性
        require(request.timestamp > 0, "Invalid request ID");
        require(!request.processed, "Request already processed");
        require(
            block.timestamp <= request.timestamp + DECRYPTION_TIMEOUT,
            "Request expired"
        );
        
        uint256 pollId = request.pollId;
        Poll storage poll = polls[pollId];
        
        // 验证投票状态
        require(poll.status == PollStatus.Ended, "Poll must be ended");
        require(!poll.resultsDecrypted, "Results already decrypted");
        
        // 更新解密结果
        for (uint256 i = 0; i < decryptedInput.length && i < poll.results.length; i++) {
            poll.results[i] = uint32(decryptedInput[i]);
        }
        
        poll.resultsDecrypted = true;
        poll.status = PollStatus.Completed;  // ✅ 更新状态为已完成
        request.processed = true;  // 标记请求已处理

        emit ResultsDecrypted(poll.id, poll.results);
    }

    /**
     * @notice 重试解密请求（符合手册标准）
     * @param _pollId 投票ID
     * @return newRequestId 新的解密请求ID
     */
    function retryDecryption(uint256 _pollId) external returns (uint256 newRequestId) {
        uint256 oldRequestId = pollToRequestId[_pollId];
        DecryptionRequest storage request = decryptionRequests[oldRequestId];
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(poll.status == PollStatus.PendingDecrypt || poll.status == PollStatus.Ended, "Not retriable");
        require(!request.processed, "Already processed");
        require(request.retryCount < MAX_RETRIES, "Max retries exceeded");
        require(
            block.timestamp > request.timestamp + 5 minutes,  // 至少等待 5 分钟
            "Too soon to retry"
        );
        
        request.retryCount++;
        emit DecryptionRetrying(oldRequestId, _pollId, request.retryCount);
        
        // 重新提交解密请求
        uint256[] memory cts = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            cts[i] = Gateway.toUint256(poll.encryptedVotes[i]);
        }
        
        newRequestId = Gateway.requestDecryption(
            cts,
            this.callbackDecryption.selector,
            CALLBACK_GAS_LIMIT,
            block.timestamp + DECRYPTION_TIMEOUT,
            false
        );
        
        // 更新请求映射
        decryptionRequests[newRequestId] = DecryptionRequest({
            pollId: _pollId,
            requester: msg.sender,
            timestamp: block.timestamp,
            retryCount: request.retryCount,
            processed: false
        });
        
        pollToRequestId[_pollId] = newRequestId;
        
        emit DecryptionRequested(newRequestId, _pollId, block.timestamp);
        
        return newRequestId;
    }

    /**
     * @notice 取消过期投票（符合手册标准）
     * @param _pollId 投票ID
     */
    function cancelExpiredPoll(uint256 _pollId) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(
            poll.status == PollStatus.PendingDecrypt || 
            poll.status == PollStatus.Ended,
            "Cannot cancel"
        );
        require(
            block.timestamp > poll.endTime + DECRYPTION_TIMEOUT,
            "Not expired yet"
        );
        
        // 标记为过期
        poll.status = PollStatus.Expired;
        
        emit PollExpired(_pollId, block.timestamp);
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

    /**
     * @notice 应急处理函数（管理员/创建者使用，符合手册标准）
     * @param _pollId 投票ID
     * @param _results 手动提供的解密结果
     * @dev 仅在解密请求超时且经过足够时间后允许使用
     */
    function emergencyResolve(
        uint256 _pollId,
        uint32[] memory _results
    ) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(
            poll.status == PollStatus.PendingDecrypt || 
            poll.status == PollStatus.Ended,
            "Invalid state"
        );
        require(
            msg.sender == poll.creator,
            "Only creator can resolve"
        );
        require(
            block.timestamp > poll.endTime + DECRYPTION_TIMEOUT + 24 hours,  // 至少等待 24 小时
            "Too early for emergency"
        );
        require(_results.length == poll.options.length, "Invalid results length");
        
        // 更新结果
        for (uint256 i = 0; i < _results.length && i < poll.results.length; i++) {
            poll.results[i] = _results[i];
        }
        
        poll.resultsDecrypted = true;
        poll.status = PollStatus.Completed;
        
        emit ResultsDecrypted(poll.id, poll.results);
    }
}


