// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@unification-com/xfund-router/contracts/lib/ConsumerBase.sol";

contract UserDataContract is ConsumerBase {
    // The owner of the contract
    address public owner;

    // Unification request data type
    bytes32 public constant USER_DATA_REQUEST_TYPE = keccak256("UserDataRequest");

    constructor(address _xfundToken) ConsumerBase(_xfundToken) {
        owner = msg.sender;
    }

    // Function to save user data using Unification APIs
    function saveUserData(uint256 data) external {
        require(msg.sender != address(0), "Invalid address");

        // Create a Unification request to save user data
        bytes32 requestId = request(USER_DATA_REQUEST_TYPE, address(this), msg.sender, data);
        emit DataRequested(requestId, "UserDataRequest");
    }

    // Function to retrieve user data using Unification APIs
    function getUserData(address user) external view returns (uint256) {
        // Retrieve user data from Unification
        return uint256(getReceivedData(USER_DATA_REQUEST_TYPE, user, msg.sender));
    }
}
