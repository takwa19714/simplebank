const hre = require("hardhat");

async function main() {
    const SimpleBank = await hre.ethers.getContractFactory("SimpleBank");
    const simpleBank = await SimpleBank.deploy();
    await simpleBank.waitForDeployment();
    console.log("SimpleBank deployed to:", await simpleBank.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});