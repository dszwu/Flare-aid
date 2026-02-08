// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PayoutReceipt
 * @notice Immutable on-chain log of off-ramp payout confirmations.
 *         Links disaster events + orgs to fiat payout receipts.
 */
contract PayoutReceipt is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Receipt {
        uint256 eventId;
        uint256 orgId;
        uint256 amount;
        string fiatCurrency;
        uint256 fiatAmount;
        bytes32 offrampRefHash;
        uint256 timestamp;
        address recordedBy;
    }

    /// @notice All payout receipts
    Receipt[] public receipts;

    /// @notice Receipts per event
    mapping(uint256 => uint256[]) private eventReceiptIndices;

    /// @notice Receipts per org
    mapping(uint256 => uint256[]) private orgReceiptIndices;

    event PayoutRecorded(
        uint256 indexed eventId,
        uint256 indexed orgId,
        uint256 amount,
        string fiatCurrency,
        uint256 fiatAmount,
        bytes32 offrampRefHash,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Record a payout receipt. Immutable — cannot be updated or deleted.
     */
    function record(
        uint256 eventId,
        uint256 orgId,
        uint256 amount,
        string calldata fiatCurrency,
        uint256 fiatAmount,
        bytes32 offrampRefHash
    ) external onlyRole(ADMIN_ROLE) {
        require(eventId > 0, "Invalid event ID");
        require(orgId > 0, "Invalid org ID");
        require(amount > 0, "Amount must be > 0");
        require(bytes(fiatCurrency).length > 0, "Currency required");

        uint256 idx = receipts.length;
        receipts.push(Receipt({
            eventId: eventId,
            orgId: orgId,
            amount: amount,
            fiatCurrency: fiatCurrency,
            fiatAmount: fiatAmount,
            offrampRefHash: offrampRefHash,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        eventReceiptIndices[eventId].push(idx);
        orgReceiptIndices[orgId].push(idx);

        emit PayoutRecorded(eventId, orgId, amount, fiatCurrency, fiatAmount, offrampRefHash, block.timestamp);
    }

    /**
     * @notice Get all receipts for an event.
     */
    function getEventReceipts(uint256 eventId) external view returns (Receipt[] memory) {
        uint256[] storage indices = eventReceiptIndices[eventId];
        Receipt[] memory result = new Receipt[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = receipts[indices[i]];
        }
        return result;
    }

    /**
     * @notice Get all receipts for an org.
     */
    function getOrgReceipts(uint256 orgId) external view returns (Receipt[] memory) {
        uint256[] storage indices = orgReceiptIndices[orgId];
        Receipt[] memory result = new Receipt[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = receipts[indices[i]];
        }
        return result;
    }

    /**
     * @notice Get total receipt count.
     */
    function getReceiptCount() external view returns (uint256) {
        return receipts.length;
    }
}
