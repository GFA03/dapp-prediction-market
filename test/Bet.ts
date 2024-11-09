import hre from "hardhat";
import { expect } from "chai";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bet } from "../typechain-types";


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

    describe("Betting", () => {
        let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;
        let optionIndex: number, amount: number;

        beforeEach(async () => {
            ({ bet, owner, otherAccount } = await loadFixture(deployBet));
            optionIndex = 0;
            amount = 1000;
        });

        it("Should allow betting", async () => {
            await bet.connect(otherAccount).bet(optionIndex, { value: amount });

            const actual = await bet.getBalance();
            expect(actual).to.equal(amount);
        });

        it("Shouldn't be allowed betting multiple times", async () => {
            const amount2 = 2000;
            await bet.connect(otherAccount).bet(optionIndex, { value: amount });

            await expect(bet.connect(otherAccount).bet(optionIndex, { value: amount2 })).to.be.revertedWith('You already bet');
        });

        it("Shouldn't be allowed betting on different options", async () => {
            const optionIndex2 = 1;
            await bet.connect(otherAccount).bet(optionIndex, { value: amount });

            await expect(bet.connect(otherAccount).bet(optionIndex2, { value: amount })).to.be.revertedWith('You already bet');
        });

        it("Should not allow betting after closing", async () => {
            await bet.connect(owner).close();

            await expect(bet.connect(otherAccount).bet(optionIndex, { value: amount }))
                .to.be.revertedWith("Betting is closed");
        });

        it("Should not allow betting on invalid option", async () => {
            const invalidOptionIndex = 2;

            await expect(bet.connect(otherAccount).bet(invalidOptionIndex, { value: amount }))
                .to.be.revertedWith("Invalid option");
        });
    });
});