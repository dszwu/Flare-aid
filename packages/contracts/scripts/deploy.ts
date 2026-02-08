import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR");

  // 1. Deploy DonationVault
  const DonationVault = await ethers.getContractFactory("DonationVault");
  const vault = await DonationVault.deploy();
  await vault.waitForDeployment();
  console.log("DonationVault deployed to:", await vault.getAddress());

  // 2. Deploy AllocationRegistry
  const AllocationRegistry = await ethers.getContractFactory("AllocationRegistry");
  const registry = await AllocationRegistry.deploy();
  await registry.waitForDeployment();
  console.log("AllocationRegistry deployed to:", await registry.getAddress());

  // 3. Deploy PayoutReceipt
  const PayoutReceipt = await ethers.getContractFactory("PayoutReceipt");
  const receipt = await PayoutReceipt.deploy();
  await receipt.waitForDeployment();
  console.log("PayoutReceipt deployed to:", await receipt.getAddress());

  // 4. Deploy FTSOPriceFeed (testnet mode = true for Coston2)
  const isTestnet = (await ethers.provider.getNetwork()).chainId !== 14n;
  const FTSOPriceFeed = await ethers.getContractFactory("FTSOPriceFeed");
  const priceFeed = await FTSOPriceFeed.deploy(isTestnet);
  await priceFeed.waitForDeployment();
  console.log("FTSOPriceFeed deployed to:", await priceFeed.getAddress());

  // Output deployment summary
  const deployment = {
    network: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      DonationVault: await vault.getAddress(),
      AllocationRegistry: await registry.getAddress(),
      PayoutReceipt: await receipt.getAddress(),
      FTSOPriceFeed: await priceFeed.getAddress(),
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n--- Deployment Summary ---");
  console.log(JSON.stringify(deployment, null, 2));

  // Write deployment file for the common package
  const fs = require("fs");
  const path = require("path");
  const outDir = path.resolve(__dirname, "../../common/deployments");
  fs.mkdirSync(outDir, { recursive: true });

  const networkName = deployment.network === "14" ? "flare" : "coston2";
  fs.writeFileSync(
    path.join(outDir, `${networkName}.json`),
    JSON.stringify(deployment, null, 2)
  );
  console.log(`\nDeployment saved to packages/common/deployments/${networkName}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
