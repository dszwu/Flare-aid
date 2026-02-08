import { expect } from "chai";
import { ethers } from "hardhat";
import { PayoutReceipt } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PayoutReceipt", function () {
  let receipt: PayoutReceipt;
  let admin: SignerWithAddress;
  let nonAdmin: SignerWithAddress;

  beforeEach(async function () {
    [admin, nonAdmin] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PayoutReceipt");
    receipt = await Factory.deploy();
    await receipt.waitForDeployment();
  });

  describe("record", function () {
    const refHash = ethers.keccak256(ethers.toUtf8Bytes("mock-offramp-ref-123"));

    it("should record a payout receipt and emit event", async function () {
      await expect(
        receipt.record(1, 1, ethers.parseEther("100"), "USD", 10000, refHash)
      )
        .to.emit(receipt, "PayoutRecorded")
        .withArgs(1, 1, ethers.parseEther("100"), "USD", 10000, refHash, (v: any) => v > 0);
    });

    it("should store receipt correctly", async function () {
      await receipt.record(1, 1, ethers.parseEther("50"), "KES", 500000, refHash);

      const eventReceipts = await receipt.getEventReceipts(1);
      expect(eventReceipts.length).to.equal(1);
      expect(eventReceipts[0].fiatCurrency).to.equal("KES");
      expect(eventReceipts[0].fiatAmount).to.equal(500000);
    });

    it("should allow multiple receipts per event", async function () {
      await receipt.record(1, 1, ethers.parseEther("50"), "USD", 5000, refHash);
      await receipt.record(1, 2, ethers.parseEther("30"), "EUR", 2800, refHash);

      const eventReceipts = await receipt.getEventReceipts(1);
      expect(eventReceipts.length).to.equal(2);
    });

    it("should index by org correctly", async function () {
      await receipt.record(1, 5, ethers.parseEther("10"), "USD", 1000, refHash);
      await receipt.record(2, 5, ethers.parseEther("20"), "USD", 2000, refHash);

      const orgReceipts = await receipt.getOrgReceipts(5);
      expect(orgReceipts.length).to.equal(2);
    });

    it("should reject non-admin", async function () {
      await expect(
        receipt.connect(nonAdmin).record(1, 1, ethers.parseEther("10"), "USD", 1000, refHash)
      ).to.be.reverted;
    });

    it("should reject invalid inputs", async function () {
      await expect(receipt.record(0, 1, 100, "USD", 1000, refHash))
        .to.be.revertedWith("Invalid event ID");
      await expect(receipt.record(1, 0, 100, "USD", 1000, refHash))
        .to.be.revertedWith("Invalid org ID");
      await expect(receipt.record(1, 1, 0, "USD", 1000, refHash))
        .to.be.revertedWith("Amount must be > 0");
      await expect(receipt.record(1, 1, 100, "", 1000, refHash))
        .to.be.revertedWith("Currency required");
    });
  });
});
