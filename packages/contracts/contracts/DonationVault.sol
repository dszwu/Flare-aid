// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DonationVault
 * @notice Accepts C2FLR donations tagged by disaster event and organization.
 *         Each donation emits an on-chain event for full transparency.
 */
contract DonationVault is Ownable, ReentrancyGuard {
    struct Donation {
        address donor;
        uint256 eventId;
        uint256 orgId;
        uint256 amount;
        uint256 timestamp;
    }

    /// @notice All donations ever made
    Donation[] public donations;

    /// @notice Total donated per event
    mapping(uint256 => uint256) public eventTotals;

    /// @notice Total donated per event per org
    mapping(uint256 => mapping(uint256 => uint256)) public eventOrgTotals;

    /// @notice Indices of donations per donor
    mapping(address => uint256[]) private donorDonationIndices;

    event DonationReceived(
        address indexed donor,
        uint256 indexed eventId,
        uint256 indexed orgId,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        uint256 indexed eventId,
        uint256 indexed orgId,
        address indexed to,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Donate C2FLR to a specific event and organization.
     * @param eventId The disaster event ID
     * @param orgId The organization ID
     */
    function donate(uint256 eventId, uint256 orgId) external payable nonReentrant {
        require(msg.value > 0, "Donation must be > 0");
        require(eventId > 0, "Invalid event ID");
        require(orgId > 0, "Invalid org ID");

        uint256 idx = donations.length;
        donations.push(Donation({
            donor: msg.sender,
            eventId: eventId,
            orgId: orgId,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        eventTotals[eventId] += msg.value;
        eventOrgTotals[eventId][orgId] += msg.value;
        donorDonationIndices[msg.sender].push(idx);

        emit DonationReceived(msg.sender, eventId, orgId, msg.value, block.timestamp);
    }

    /**
     * @notice Withdraw funds for payout. Owner-only (payout orchestration).
     */
    function withdraw(
        uint256 eventId,
        uint256 orgId,
        address payable to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");

        emit FundsWithdrawn(eventId, orgId, to, amount);
    }

    /**
     * @notice Get total donation count.
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    /**
     * @notice Get a donor's donation history.
     */
    function getDonorHistory(address donor) external view returns (Donation[] memory) {
        uint256[] storage indices = donorDonationIndices[donor];
        Donation[] memory result = new Donation[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = donations[indices[i]];
        }
        return result;
    }

    /**
     * @notice Get contract balance.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
