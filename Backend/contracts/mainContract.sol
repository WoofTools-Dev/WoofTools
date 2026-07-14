// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@unification-com/xfund-router/contracts/lib/ConsumerBase.sol";

contract CoinPriceContract is ConsumerBase {
    // The owner of the contract
    address public owner;

    // Chainlink Price Feed address for ETH/USD (example)
    AggregatorV3Interface public priceFeed;

    constructor(address _xfundToken, address _priceFeedAddress) ConsumerBase(_xfundToken) {
        owner = msg.sender;
        // Initialize the Chainlink Price Feed
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    // Function to get the latest coin price in USD
    function getCoinPrice() external view returns (int256) {
        (
            uint80 roundID, 
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        return price;
    }

    // Function to save user data using Unification APIs
    function saveUserData(uint256 data) external {
        require(msg.sender != address(0), "Invalid address");
        uint256 requestId = request("userData", address(this), msg.sender, data);
        emit DataRequested(requestId, "userData");
    }

    // Function to retrieve user data using Unification APIs
    function getUserData(address user) external view returns (uint256) {
        return uint256(getReceivedData("userData", msg.sender, user));
    }
}
