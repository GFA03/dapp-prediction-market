import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bet_Factory } from "../typechain-types";

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
        await addBet(bet_factory, 10);
      });

        it("Should return 10 bets", async () => {
            const bets = await bet_factory.getBets(10, 0);
            expect(bets.length).to.equal(10);
        });
    });
  });
});
