// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract DailyWinnerContract is VRFConsumerBase {
    address public owner;
    uint256 public randomResult;
    address[] public participants;
    uint256 public deadline;

    bytes32 internal keyHash;
    uint256 internal fee;

    event WinnerSelected(address winner);

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    )
        VRFConsumerBase(_vrfCoordinator, _linkToken)
    {
        owner = msg.sender;
        keyHash = _keyHash;
        fee = _fee;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function joinContest() external {
        require(block.timestamp < deadline, "Contest is closed.");
        participants.push(msg.sender);
    }

    function pickWinner() external onlyOwner {
        require(participants.length > 0, "No participants in the contest");
        require(block.timestamp > deadline, "Contest is still running");

        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK in contract");

        uint256 seed = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.coinbase, block.timestamp));
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(seed, blockhash(block.number - 1), participants)));

        randomResult = uint256(keccak256(abi.encode(randomNumber, participants)));
        uint256 randomSeed = randomResult % participants.length;

        address winner = participants[randomSeed];

        emit WinnerSelected(winner);
        participants = new address[](0); // Reset participants for the next round
        deadline = block.timestamp + 1 days; // Set the next contest's deadline
    }

    function withdrawLink() external onlyOwner {
        LINK.transfer(owner, LINK.balanceOf(address(this));
    }
}
