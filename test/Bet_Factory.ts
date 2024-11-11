import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bet_Factory, Bet_Factory__factory } from "../typechain-types";
import { Bet, Bet__factory } from "../typechain-types";
import { BaseContract } from "ethers";

describe("Bet_Factory", () => {
  async function deployBetFactory() {
    const bet_factory = await hre.ethers.deployContract("Bet_Factory", []);
    return { bet_factory };
  }

  async function addBet(bet_factory: Bet_Factory, count: number) {
    const name = "Test ";
    const options = ["Option 1", "Option 2"];
    for (let i = 0; i < count; i++) {
      await bet_factory.createBet(name + i, options);
    }
  }

  describe("Deployment", () => {
    it("Should deploy correctly", async () => {
      const { bet_factory } = await loadFixture(deployBetFactory);
      expect(await bet_factory.getAddress()).to.properAddress;
    });
  });

  describe("Creation of bets", () => {
    it("Should increase bets count", async () => {
      const { bet_factory } = await loadFixture(deployBetFactory);
      const prevCount = await bet_factory.betsCount();
      const bet = await bet_factory.createBet("Test 1", [
        "Option 1",
        "Option 2",
      ]);
      const actualCount = await bet_factory.betsCount();
      expect(actualCount).to.equal(prevCount + BigInt(1));
    });

    it("Should emit the BetCreated event", async () => {
      const { bet_factory } = await loadFixture(deployBetFactory);
      await expect(
        bet_factory.createBet("Test 1", ["Option 1", "Option 2"])
      ).to.emit(bet_factory, "BetCreated");
    });
  });

  describe("Get bets", () => {
    it("Should return an empty collection", async () => {
      const { bet_factory } = await loadFixture(deployBetFactory);
      const bets = await bet_factory.getBets(10, 0);
      expect(bets.length).to.equal(0);
    });

    describe("Varying limits", () => {
      let bet_factory: Bet_Factory;

      beforeEach(async () => {
        ({ bet_factory } = await loadFixture(deployBetFactory));
        await addBet(bet_factory, 30);
      });

        it("Should return 10 bets", async () => {
            const bets = await bet_factory.getBets(10, 0);
            expect(bets.length).to.equal(10);
        });

        it("Should return 20 bets when limit requested is 20", async () => {
            const bets = await bet_factory.getBets(20, 0);
            expect(bets.length).to.equal(20);
        });

        it("Should return 20 bets when limit requested is 30", async () => {
            const bets = await bet_factory.getBets(30, 0);
            expect(bets.length).to.equal(20);
        });
    });

    describe('Varying offsets', () => { 
        let bet_factory: Bet_Factory;

        beforeEach(async () => {
            ({ bet_factory } = await loadFixture(deployBetFactory));
            await addBet(bet_factory, 30);
        });

        it("Should contain the bet with the appropiate offset", async () => {
            const BetContract = await hre.ethers.getContractFactory("Bet");
            const bets = await bet_factory.getBets(1, 0);
            const bet = BetContract.attach(bets[0]);
            const name = await bet.name();
            expect(name).to.equal("Test 0");
        });

        it("Should contain the 7th bet when offset is 6", async () => {
            const BetContract = await hre.ethers.getContractFactory("Bet");
            const bets = await bet_factory.getBets(1, 6);
            const bet: BaseContract = BetContract.attach(bets[0]);
            const name = await bet.name();
            expect(name).to.equal("Test 6");
        });

        it('Should return 10 bets', async () => {
            const bets = await bet_factory.getBets(10, 0);
            expect(bets.length).to.equal(10);
        });

        it('Should return 10 bets when offset is 10', async () => {
            const bets = await bet_factory.getBets(10, 10);
            expect(bets.length).to.equal(10);
        });

        it('Should return 10 bets when offset is 20', async () => {
            const bets = await bet_factory.getBets(10, 20);
            expect(bets.length).to.equal(10);
        });

        it('Should return 0 bets when offset is 30', async () => {
            const bets = await bet_factory.getBets(10, 30);
            expect(bets.length).to.equal(0);
        });

        it("Should not allow to set the offset to a value greater than the bets count", async () => {
            await expect(bet_factory.getBets(10, 31)).to.be.revertedWith("offset out of bounds");
        });
     })
  });
});
