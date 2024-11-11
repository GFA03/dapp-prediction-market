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

    describe('Creation of bets', () => { 
        it("Should increase bets count", async () => {
            const { bet_factory } = await loadFixture(deployBetFactory);
            const prevCount = await bet_factory.betsCount();
            const bet = await bet_factory.createBet('Test 1', ['Option 1', 'Option 2']);
            const actualCount = await bet_factory.betsCount();
            expect(actualCount).to.equal(prevCount + BigInt(1));
        });

        it("Should emit the BetCreated event", async () => {
            const { bet_factory } = await loadFixture(deployBetFactory);
            await expect(bet_factory.createBet('Test 1', ['Option 1', 'Option 2'])).to.emit(bet_factory, 'BetCreated');
        });
     })
})