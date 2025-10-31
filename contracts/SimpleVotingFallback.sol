// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleVotingFallback
 * @notice 简化版投票合约，支持 Fallback 模式（不需要 Gateway）
 * @dev 仅用于测试基础功能，没有 FHE 加密
 */
contract SimpleVotingFallback {
    
    struct Poll {
        uint256 id;
        string title;
        string[] options;
        address creator;
        uint256 endTime;
        bool isActive;
        mapping(address => bool) hasVoted;
        uint256[] voteCounts;  // 明文投票计数
    }
    
    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    
    event PollCreated(uint256 indexed pollId, string title, address indexed creator, uint256 endTime);
    event VoteSubmitted(uint256 indexed pollId, address indexed voter, uint256 optionIndex);
    
    /**
     * @notice 创建投票（简化版，无需加密）
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
        newPoll.isActive = true;
        
        // 初始化投票计数
        for (uint256 i = 0; i < _options.length; i++) {
            newPoll.voteCounts.push(0);
        }
        
        emit PollCreated(pollId, _title, msg.sender, newPoll.endTime);
        return pollId;
    }
    
    /**
     * @notice 投票（明文，无需加密）
     */
    function vote(uint256 _pollId, uint256 _optionIndex) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.id != 0, "Poll does not exist");
        require(poll.isActive, "Poll is not active");
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_optionIndex < poll.options.length, "Invalid option index");
        
        poll.hasVoted[msg.sender] = true;
        poll.voteCounts[_optionIndex]++;
        
        emit VoteSubmitted(_pollId, msg.sender, _optionIndex);
    }
    
    /**
     * @notice 获取投票信息
     */
    function getPollInfo(uint256 _pollId) external view returns (
        uint256 id,
        string memory title,
        string[] memory options,
        address creator,
        uint256 endTime,
        bool isActive
    ) {
        Poll storage poll = polls[_pollId];
        require(poll.id != 0, "Poll does not exist");
        
        return (
            poll.id,
            poll.title,
            poll.options,
            poll.creator,
            poll.endTime,
            poll.isActive
        );
    }
    
    /**
     * @notice 获取投票结果（实时可见）
     */
    function getResults(uint256 _pollId) external view returns (uint256[] memory) {
        Poll storage poll = polls[_pollId];
        require(poll.id != 0, "Poll does not exist");
        
        return poll.voteCounts;
    }
    
    /**
     * @notice 检查是否已投票
     */
    function hasVoted(uint256 _pollId, address _voter) external view returns (bool) {
        return polls[_pollId].hasVoted[_voter];
    }
}



