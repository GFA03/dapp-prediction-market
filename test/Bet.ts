import hre from "hardhat";
import { expect } from "chai";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";


describe("Bet", () => {
    async function deployBet() {
        const name = 'Test Bet';
        const options = ['Option 1', 'Option 2'];

        const [owner, otherAccount] = await hre.ethers.getSigners();

        const bet = await hre.ethers.deployContract("Bet", [name, options]);

        return {bet, name, options, owner, otherAccount};
    }

    describe("Deployment", () => {
        it("Should deploy correctly", async () => {
            const { bet } = await loadFixture(deployBet);

            const addr = await bet.getAddress();
            expect(addr).to.properAddress;
        });

        it("Should set the right owner", async () => {
            const { bet, owner } = await loadFixture(deployBet);

            const actual = await bet.owner();
            expect(actual).to.equal(owner.address);
        });

        it("Should set the right status", async () => {
            const { bet } = await loadFixture(deployBet);

            const actual = await bet.status();
            // status equals 'Open' which is 0
            expect(actual).to.equal(0);
        });

        it("Should set the right name", async () => {
            const { bet, name } = await loadFixture(deployBet);
            
            const actual = await bet.name();
            expect(actual).to.equal(name);
        });

        it("Should set the right options", async () => {
            const { bet, options } = await loadFixture(deployBet);

            const actual = await bet.getOptions();

            expect(actual).to.be.an('array');
            expect(actual).to.have.lengthOf(options.length);
            expect(actual).to.deep.equal(options);
        });

    });
});