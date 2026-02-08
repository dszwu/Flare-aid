// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AllocationRegistry
 * @notice Records admin-approved allocation splits for disaster events.
 *         Each event maps to a set of organizations with basis-point splits (sum = 10000).
 */
contract AllocationRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Allocation {
        uint256[] orgIds;
        uint256[] splitBps;
        address approvedBy;
        uint256 approvedAt;
    }

    /// @notice Event ID → allocation
    mapping(uint256 => Allocation) private allocations;

    /// @notice Track which events have allocations
    uint256[] public allocatedEvents;

    event AllocationSet(
        uint256 indexed eventId,
        uint256[] orgIds,
        uint256[] splitBps,
        address indexed approvedBy,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Set allocation splits for an event. Splits must sum to 10000 (100%).
     * @param eventId The disaster event ID
     * @param orgIds Array of organization IDs
     * @param splitBps Array of basis-point allocations (must sum to 10000)
     */
    function setAllocation(
        uint256 eventId,
        uint256[] calldata orgIds,
        uint256[] calldata splitBps
    ) external onlyRole(ADMIN_ROLE) {
        require(eventId > 0, "Invalid event ID");
        require(orgIds.length > 0, "Need at least one org");
        require(orgIds.length == splitBps.length, "Arrays length mismatch");

        uint256 totalBps = 0;
        for (uint256 i = 0; i < splitBps.length; i++) {
            require(splitBps[i] > 0, "Split must be > 0");
            totalBps += splitBps[i];
        }
        require(totalBps == 10000, "Splits must sum to 10000");

        // Track new event allocations
        if (allocations[eventId].orgIds.length == 0) {
            allocatedEvents.push(eventId);
        }

        allocations[eventId] = Allocation({
            orgIds: orgIds,
            splitBps: splitBps,
            approvedBy: msg.sender,
            approvedAt: block.timestamp
        });

        emit AllocationSet(eventId, orgIds, splitBps, msg.sender, block.timestamp);
    }

    /**
     * @notice Get allocation for an event.
     */
    function getAllocation(uint256 eventId)
        external
        view
        returns (uint256[] memory orgIds, uint256[] memory splitBps, address approvedBy, uint256 approvedAt)
    {
        Allocation storage a = allocations[eventId];
        return (a.orgIds, a.splitBps, a.approvedBy, a.approvedAt);
    }

    /**
     * @notice Check if an event has an allocation set.
     */
    function hasAllocation(uint256 eventId) external view returns (bool) {
        return allocations[eventId].orgIds.length > 0;
    }

    /**
     * @notice Get the count of events with allocations.
     */
    function getAllocatedEventCount() external view returns (uint256) {
        return allocatedEvents.length;
    }
}
