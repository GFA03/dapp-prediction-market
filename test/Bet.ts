import hre from "hardhat";
import { expect } from "chai";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";


describe("Bet", () => {
    async function deployBet() {
        const name = 'Test Bet';
        const options = ['Option 1', 'Option 2'];

        const bet = await hre.ethers.deployContract("Bet", [name, options]);

        return {bet, name, options};
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
        });

        // it should get the bet's options
        it("Should get the bet's options", async () => {
            const { bet, options } = await loadFixture(deployBet);

            const actual = await bet.getOptions();
            
            expect(actual).to.be.an('array');
            expect(actual).to.have.lengthOf(options.length);
            expect(actual).to.deep.equal(options);
        });

    });
});