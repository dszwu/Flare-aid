import { expect } from "chai";
import { ethers } from "hardhat";
import { AllocationRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AllocationRegistry", function () {
  let registry: AllocationRegistry;
  let admin: SignerWithAddress;
  let nonAdmin: SignerWithAddress;

  beforeEach(async function () {
    [admin, nonAdmin] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AllocationRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  describe("setAllocation", function () {
    it("should set allocation and emit event", async function () {
      await expect(registry.setAllocation(1, [1, 2], [6000, 4000]))
        .to.emit(registry, "AllocationSet")
        .withArgs(1, [1, 2], [6000, 4000], admin.address, (v: any) => v > 0);
    });

    it("should store allocation correctly", async function () {
      await registry.setAllocation(1, [1, 2, 3], [5000, 3000, 2000]);
      const [orgIds, splitBps] = await registry.getAllocation(1);
      expect(orgIds.map(Number)).to.deep.equal([1, 2, 3]);
      expect(splitBps.map(Number)).to.deep.equal([5000, 3000, 2000]);
    });

    it("should reject splits not summing to 10000", async function () {
      await expect(registry.setAllocation(1, [1, 2], [5000, 4000]))
        .to.be.revertedWith("Splits must sum to 10000");
    });

    it("should reject empty org array", async function () {
      await expect(registry.setAllocation(1, [], []))
        .to.be.revertedWith("Need at least one org");
    });

    it("should reject mismatched array lengths", async function () {
      await expect(registry.setAllocation(1, [1, 2], [10000]))
        .to.be.revertedWith("Arrays length mismatch");
    });

    it("should reject zero splits", async function () {
      await expect(registry.setAllocation(1, [1, 2], [0, 10000]))
        .to.be.revertedWith("Split must be > 0");
    });

    it("should reject non-admin", async function () {
      await expect(registry.connect(nonAdmin).setAllocation(1, [1], [10000]))
        .to.be.reverted;
    });

    it("should allow updating allocation", async function () {
      await registry.setAllocation(1, [1], [10000]);
      await registry.setAllocation(1, [2, 3], [7000, 3000]);
      const [orgIds] = await registry.getAllocation(1);
      expect(orgIds.map(Number)).to.deep.equal([2, 3]);
    });
  });

  describe("hasAllocation", function () {
    it("should return false for unset event", async function () {
      expect(await registry.hasAllocation(999)).to.be.false;
    });

    it("should return true for set event", async function () {
      await registry.setAllocation(1, [1], [10000]);
      expect(await registry.hasAllocation(1)).to.be.true;
    });
  });
});
