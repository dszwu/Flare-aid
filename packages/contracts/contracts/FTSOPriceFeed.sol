// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FTSOPriceFeed
 * @notice Reads FLR/USD price from Flare's enshrined FTSO (FTSOv2).
 *         Uses the ContractRegistry to dynamically resolve the FtsoV2 address.
 *         This contract demonstrates integration with Flare's enshrined data protocol.
 */

// Minimal interface for FlareContractRegistry
interface IFlareContractRegistry {
    function getContractAddressByName(string memory _name) external view returns (address);
}

// Minimal interface for FtsoV2
interface IFtsoV2 {
    function getFeedById(bytes21 _feedId) external payable returns (uint256 _value, int8 _decimals, uint64 _timestamp);
}

// Minimal interface for TestFtsoV2 (view methods for testnet)
interface ITestFtsoV2 {
    function getFeedById(bytes21 _feedId) external view returns (uint256 _value, int8 _decimals, uint64 _timestamp);
}

contract FTSOPriceFeed {
    // FlareContractRegistry address — same across all Flare networks
    address public constant FLARE_CONTRACT_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

    // FLR/USD feed ID (category 1 = Crypto, "FLR/USD")
    // Encoded as: 0x01464c522f55534400000000000000000000000000
    bytes21 public constant FLR_USD_FEED_ID = bytes21(0x01464c522f55534400000000000000000000000000);

    // Whether to use testnet (view) interface vs mainnet (payable)
    bool public immutable isTestnet;

    event PriceRead(uint256 value, int8 decimals, uint64 timestamp);

    constructor(bool _isTestnet) {
        isTestnet = _isTestnet;
    }

    /**
     * @notice Get the current FLR/USD price from FTSO.
     * @return value The raw price value
     * @return decimals The decimal places to divide by
     * @return timestamp When the price was last updated
     */
    function getFlrUsdPrice()
        external
        view
        returns (uint256 value, int8 decimals, uint64 timestamp)
    {
        address ftsoV2Addr = IFlareContractRegistry(FLARE_CONTRACT_REGISTRY)
            .getContractAddressByName("FtsoV2");
        require(ftsoV2Addr != address(0), "FtsoV2 not found in registry");

        // On testnet (Coston2), use view-compatible interface
        (value, decimals, timestamp) = ITestFtsoV2(ftsoV2Addr).getFeedById(FLR_USD_FEED_ID);
    }

    /**
     * @notice Convert a C2FLR amount to its USD equivalent using FTSO.
     * @param flrAmount Amount in wei (18 decimals)
     * @return usdValue USD value scaled to 6 decimals
     */
    function flrToUsd(uint256 flrAmount) external view returns (uint256 usdValue) {
        (uint256 price, int8 decimals, ) = this.getFlrUsdPrice();

        // price = raw FTSO value, need to adjust for decimals
        // flrAmount is in wei (18 decimals)
        // We want USD with 6 decimals
        if (decimals >= 0) {
            usdValue = (flrAmount * price) / (10 ** (18 + uint8(int8(18) - decimals) - 6));
        } else {
            usdValue = (flrAmount * price) / (10 ** (18 + uint8(int8(18) + (-decimals)) - 6));
        }
    }
}
