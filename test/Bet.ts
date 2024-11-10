import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bet } from "../typechain-types";

describe("Bet", () => {
  const OPTION_INDEX = 0;
  const AMOUNT = 1000;
  const INVALID_OPTION_INDEX = 2;
  const REVERT_BET_CLOSED = "Betting is closed";
  const REVERT_ALREADY_BET = "You already bet";
  const REVERT_INVALID_OPTION = "Invalid option";

  async function deployBet() {
    const name = "Test Bet";
    const options = ["Option 1", "Option 2"];
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const bet = await hre.ethers.deployContract("Bet", [name, options]);
    return { bet, name, options, owner, otherAccount };
  }

  describe("Deployment", () => {
    it("Should deploy correctly with the right address, owner, status, name, and options", async () => {
      const { bet, name, options, owner } = await loadFixture(deployBet);
      expect(await bet.getAddress()).to.properAddress;
      expect(await bet.owner()).to.equal(owner.address);
      expect(await bet.status()).to.equal(0); // Status.Open is 0
      expect(await bet.name()).to.equal(name);
      expect(await bet.getOptions()).to.deep.equal(options);
    });
  });

  describe("Betting", () => {
    let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;

    beforeEach(async () => {
      ({ bet, owner, otherAccount } = await loadFixture(deployBet));
    });

    async function placeBet(
      account: HardhatEthersSigner,
      option = OPTION_INDEX,
      amount = AMOUNT
    ) {
      return bet.connect(account).bet(option, { value: amount });
    }

    it("Should allow a single bet and update the balance", async () => {
      await placeBet(otherAccount);
      expect(await bet.getBalance()).to.equal(AMOUNT);
    });

    it("Should not allow betting multiple times by the same account", async () => {
      await placeBet(otherAccount);
      await expect(placeBet(otherAccount)).to.be.revertedWith(
        REVERT_ALREADY_BET
      );
    });

    it("Should revert on multiple bets with different options", async () => {
      await placeBet(otherAccount);
      await expect(placeBet(otherAccount, 1)).to.be.revertedWith(
        REVERT_ALREADY_BET
      );
    });

    it("Should revert if betting is closed", async () => {
      await bet.connect(owner).close();
      await expect(placeBet(otherAccount)).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });

    it("Should revert for invalid option", async () => {
      await expect(
        placeBet(otherAccount, INVALID_OPTION_INDEX)
      ).to.be.revertedWith(REVERT_INVALID_OPTION);
    });

    it("Should allow different accounts to bet on the same option and accumulate balance", async () => {
      await placeBet(otherAccount);
      await placeBet(owner);
      expect(await bet.getBalance()).to.equal(AMOUNT * 2);
    });

    it("Should allow different accounts to bet on different options and accumulate balance", async () => {
      await placeBet(otherAccount);
      await placeBet(owner, 1);
      expect(await bet.getBalance()).to.equal(AMOUNT * 2);
    });

    it("Should revert bets after event is canceled", async () => {
      await bet.connect(owner).cancel();
      await expect(placeBet(otherAccount)).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });
  });

  describe("Withdrawing", () => {
    let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;

    beforeEach(async () => {
      ({ bet, owner, otherAccount } = await loadFixture(deployBet));
    });

    async function placeBet(
      account: HardhatEthersSigner,
      option = OPTION_INDEX,
      amount = AMOUNT
    ) {
      return bet.connect(account).bet(option, { value: amount });
    }

    it("Should allow a bettor to withdraw their bet", async () => {
      const provider = hre.ethers.provider;
      await placeBet(otherAccount);
      const postBetBalance = await provider.getBalance(otherAccount.address);

      const tx = await bet.connect(otherAccount).withdrawBet();
      const receipt = await tx.wait();
      const postWithdrawBalance = await provider.getBalance(
        otherAccount.address
      );
      if (receipt !== null) {
        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.gasPrice;

        const expectedBalanceAfterWithdraw =
          postBetBalance + BigInt(AMOUNT) - gasUsed * gasPrice;
        expect(postWithdrawBalance).to.equal(expectedBalanceAfterWithdraw);
      }
    });

    it("Should not allow a bettor to withdraw if he has not bet", async () => {
      await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith(
        "You didn't bet"
      );
    });

    it("Should not allow a bettor to withdraw twice", async () => {
      await placeBet(otherAccount);
      await bet.connect(otherAccount).withdrawBet();
      await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith(
        "You didn't bet"
      );
    });

    it("Should not allow a bettor to withdraw after the event is canceled", async () => {
      await placeBet(otherAccount);
      await bet.connect(owner).cancel();
      await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith(
        "Betting is closed"
      );
    });

    it("Should not allow a bettor to withdraw after the event is closed", async () => {
      await placeBet(otherAccount);
      await bet.connect(owner).close();
      await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith(
        "Betting is closed"
      );
    });

    it("Should emit a Cashback event", async () => {
      await placeBet(otherAccount);
      await expect(bet.connect(otherAccount).withdrawBet())
        .to.emit(bet, "CashbackEvent")
        .withArgs(otherAccount.address, AMOUNT);
    });
  });

  describe("Closing Betting", () => {
    let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;

    beforeEach(async () => {
      ({ bet, owner, otherAccount } = await loadFixture(deployBet));
    });

    it("Should allow the owner to close the event", async () => {
      await bet.connect(owner).close();
      expect(await bet.status()).to.equal(1); // Status.Closed is 1
    });

    it("Should not allow a non-owner to close the event", async () => {
      await expect(bet.connect(otherAccount).close())
        .to.be.revertedWithCustomError(bet, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
    // await bet.connect(otherAccount).close();

    it("Should not allow betting after the event is closed", async () => {
      await bet.connect(owner).close();
      await expect(
        bet.connect(otherAccount).bet(OPTION_INDEX, { value: AMOUNT })
      ).to.be.revertedWith(REVERT_BET_CLOSED);
    });

    it("Should not allow withdrawing after the event is closed", async () => {
      await bet.connect(otherAccount).bet(OPTION_INDEX, { value: AMOUNT });
      await bet.connect(owner).close();
      await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });

    it("Should not allow canceling after the event is closed", async () => {
      await bet.connect(owner).close();
      await expect(bet.connect(owner).cancel()).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });
  });

  describe("Canceling Betting", () => {
    let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;

    beforeEach(async () => {
      ({ bet, owner, otherAccount } = await loadFixture(deployBet));
    });

    async function placeBet(
      account: HardhatEthersSigner,
      option = OPTION_INDEX,
      amount = AMOUNT
    ) {
      return bet.connect(account).bet(option, { value: amount });
    }

    it("Should allow the owner to cancel the event", async () => {
      await bet.connect(owner).cancel();
      expect(await bet.status()).to.equal(2); // Status.Canceled is 2
    });

    it("Should not allow a non-owner to cancel the event", async () => {
      await expect(bet.connect(otherAccount).cancel())
        .to.be.revertedWithCustomError(bet, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });

    it("Should not allow betting after the event is canceled", async () => {
      await bet.connect(owner).cancel();
      await expect(
        bet.connect(otherAccount).bet(OPTION_INDEX, { value: AMOUNT })
      ).to.be.revertedWith(REVERT_BET_CLOSED);
    });

    it("Should not allow withdrawing after the event is canceled", async () => {
      await bet.connect(otherAccount).bet(OPTION_INDEX, { value: AMOUNT });
      await bet.connect(owner).cancel();
      await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });

    it("Should not allow closing after the event is canceled", async () => {
      await bet.connect(owner).cancel();
      await expect(bet.connect(owner).close()).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });

    it("Should refund the bettors after the event is canceled", async () => {
      await placeBet(otherAccount);
      const preBalance = await hre.ethers.provider.getBalance(
        otherAccount.address
      );
      await bet.connect(owner).cancel();
      const postBalance = await hre.ethers.provider.getBalance(
        otherAccount.address
      );
      expect(postBalance).to.equal(preBalance + BigInt(AMOUNT));
    });
  });
});
//todo: add tests for canceling the event (inclusive of account getting their funds back)
