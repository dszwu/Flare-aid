import { expect } from "chai";
import { ethers } from "hardhat";
import { DonationVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DonationVault", function () {
  let vault: DonationVault;
  let owner: SignerWithAddress;
  let donor1: SignerWithAddress;
  let donor2: SignerWithAddress;
  let recipient: SignerWithAddress;

  beforeEach(async function () {
    [owner, donor1, donor2, recipient] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DonationVault");
    vault = await Factory.deploy();
    await vault.waitForDeployment();
  });

  describe("donate", function () {
    it("should accept donations and emit event", async function () {
      const amount = ethers.parseEther("1.0");
      await expect(vault.connect(donor1).donate(1, 1, { value: amount }))
        .to.emit(vault, "DonationReceived")
        .withArgs(donor1.address, 1, 1, amount, (v: any) => v > 0);
    });

    it("should update event totals", async function () {
      await vault.connect(donor1).donate(1, 1, { value: ethers.parseEther("1.0") });
      await vault.connect(donor2).donate(1, 2, { value: ethers.parseEther("2.0") });
      expect(await vault.eventTotals(1)).to.equal(ethers.parseEther("3.0"));
    });

    it("should reject zero-value donations", async function () {
      await expect(vault.connect(donor1).donate(1, 1, { value: 0 }))
        .to.be.revertedWith("Donation must be > 0");
    });

    it("should reject invalid event ID", async function () {
      await expect(vault.connect(donor1).donate(0, 1, { value: 100 }))
        .to.be.revertedWith("Invalid event ID");
    });

    it("should reject invalid org ID", async function () {
      await expect(vault.connect(donor1).donate(1, 0, { value: 100 }))
        .to.be.revertedWith("Invalid org ID");
    });
  });

  describe("getDonorHistory", function () {
    it("should return donor's donation history", async function () {
      await vault.connect(donor1).donate(1, 1, { value: ethers.parseEther("1.0") });
      await vault.connect(donor1).donate(2, 1, { value: ethers.parseEther("0.5") });

      const history = await vault.getDonorHistory(donor1.address);
      expect(history.length).to.equal(2);
      expect(history[0].eventId).to.equal(1);
      expect(history[1].eventId).to.equal(2);
    });

    it("should return empty array for non-donor", async function () {
      const history = await vault.getDonorHistory(donor2.address);
      expect(history.length).to.equal(0);
    });
  });

  describe("withdraw", function () {
    it("should allow owner to withdraw", async function () {
      await vault.connect(donor1).donate(1, 1, { value: ethers.parseEther("5.0") });

      const balBefore = await ethers.provider.getBalance(recipient.address);
      await vault.connect(owner).withdraw(1, 1, recipient.address, ethers.parseEther("2.0"));
      const balAfter = await ethers.provider.getBalance(recipient.address);

      expect(balAfter - balBefore).to.equal(ethers.parseEther("2.0"));
    });

    it("should reject non-owner withdrawals", async function () {
      await vault.connect(donor1).donate(1, 1, { value: ethers.parseEther("1.0") });
      await expect(
        vault.connect(donor1).withdraw(1, 1, donor1.address, ethers.parseEther("1.0"))
      ).to.be.reverted;
    });

    it("should reject withdrawal exceeding balance", async function () {
      await vault.connect(donor1).donate(1, 1, { value: ethers.parseEther("1.0") });
      await expect(
        vault.connect(owner).withdraw(1, 1, recipient.address, ethers.parseEther("5.0"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
