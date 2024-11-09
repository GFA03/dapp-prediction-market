import hre from "hardhat";
import { expect } from "chai";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";


describe("Bet", () => {
    async function deployBet() {
        const name = 'Test Bet';

        const bet = await hre.ethers.deployContract("Bet", [name]);

        return {bet, name};
    }

    describe("Deployment", () => {
        it("Should deploy correctly", async () => {
            const { bet } = await loadFixture(deployBet);

            const addr = await bet.getAddress();
            expect(addr).to.properAddress;
        });

        it("Should get the bet's name", async () => {
            const { bet, name } = await loadFixture(deployBet);
            
            const actual = await bet.name();
            expect(actual).to.equal(name);
        })
    });
});