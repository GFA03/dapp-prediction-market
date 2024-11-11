import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";


describe("Bet_Factory", () => {
    async function deployBetFactory() {
        const bet_factory = await hre.ethers.deployContract("Bet_Factory", []);
        return {bet_factory};
    }

    describe("Deployment", () => {
        it("Should deploy correctly", async () => {
            const { bet_factory } = await loadFixture(deployBetFactory);
            expect(await bet_factory.getAddress()).to.properAddress;
        })
    })
})