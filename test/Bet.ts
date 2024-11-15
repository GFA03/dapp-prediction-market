import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bet } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

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
    const [owner, otherAccount, user1, user2] = await hre.ethers.getSigners();
    const bet = await hre.ethers.deployContract("Bet", [name, options, owner.address]);
    return { bet, name, options, owner, otherAccount, user1, user2 };
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

    it("Should not allow deployment if less than 2 options provided", async () => {
      const name = "Test Bet";
      const options = ["Option 1"];
      const [owner] = await hre.ethers.getSigners();
      await expect(hre.ethers.deployContract("Bet", [name, options, owner.address])).to.be.revertedWith("At least 2 options required");
    });

    it("Should not allow deployment if more than 8 options provided", async () => {
      const name = "Test Bet";
      const options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6", "Option 7", "Option 8", "Option 9"];
      const [owner] = await hre.ethers.getSigners();
      await expect(hre.ethers.deployContract("Bet", [name, options, owner.address])).to.be.revertedWith("Maximum 8 options allowed");
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

    it("Should revert bet if value is 0", async () => {
      await expect(bet.connect(otherAccount).bet(OPTION_INDEX, { value: 0 })).to.be.revertedWith("Value must be greater than 0");
    });
  });

  describe("Cashback", () => {
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

    // it("Should allow a bettor to withdraw their bet", async () => {
    //   const provider = hre.ethers.provider;
    //   await placeBet(otherAccount);
    //   const postBetBalance = await provider.getBalance(otherAccount.address);

    //   const tx = await bet.connect(otherAccount).cashbackBet();
    //   const receipt = await tx.wait();
    //   const postWithdrawBalance = await provider.getBalance(
    //     otherAccount.address
    //   );
    //   if (receipt !== null) {
    //     const gasUsed = receipt.gasUsed;
    //     const gasPrice = receipt.gasPrice;

    //     const expectedBalanceAfterWithdraw =
    //       postBetBalance + BigInt(AMOUNT) - gasUsed * gasPrice;
    //     expect(postWithdrawBalance).to.equal(expectedBalanceAfterWithdraw);
    //   }
    // });

    it("Should allow a bettor to cashback their bet", async () => {
      await placeBet(otherAccount);
      
      await expect(bet.connect(otherAccount).cashbackBet()).to.changeEtherBalances(
        [otherAccount, bet],
        [BigInt(AMOUNT), BigInt(-AMOUNT)]
      );
    });

    it("Should not allow a bettor to cashback if he has not bet", async () => {
      await expect(bet.connect(otherAccount).cashbackBet()).to.be.revertedWith(
        "You didn't bet"
      );
    });

    it("Should not allow a bettor to cashback twice", async () => {
      await placeBet(otherAccount);
      await bet.connect(otherAccount).cashbackBet();
      await expect(bet.connect(otherAccount).cashbackBet()).to.be.revertedWith(
        "You didn't bet"
      );
    });

    it("Should not allow a bettor to cashback after the event is canceled", async () => {
      await placeBet(otherAccount);
      await bet.connect(owner).cancel();
      await expect(bet.connect(otherAccount).cashbackBet()).to.be.revertedWith(
        "Betting is closed"
      );
    });

    it("Should not allow a bettor to cashback after the event is closed", async () => {
      await placeBet(otherAccount);
      await bet.connect(owner).close();
      await expect(bet.connect(otherAccount).cashbackBet()).to.be.revertedWith(
        "Betting is closed"
      );
    });

    it("Should emit a Cashback event", async () => {
      await placeBet(otherAccount);
      await expect(bet.connect(otherAccount).cashbackBet())
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
      await expect(bet.connect(otherAccount).cashbackBet()).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });

    it("Should not allow canceling after the event is closed", async () => {
      await bet.connect(owner).close();
      await expect(bet.connect(owner).cancel()).to.be.revertedWith(
        REVERT_BET_CLOSED
      );
    });

    it("Should emit Closing Event", async () => {
      await expect(bet.connect(owner).close()).to.emit(bet, "CloseEvent");
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
      await expect(bet.connect(otherAccount).cashbackBet()).to.be.revertedWith(
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

    it("Should emit Canceling Event", async () => {
      await expect(bet.connect(owner).cancel()).to.emit(bet, "CancelEvent");
    });
  });

  describe("Winning", () => {
    let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner, user1: HardhatEthersSigner, user2: HardhatEthersSigner;

    beforeEach(async () => {
      ({ bet, owner, otherAccount, user1, user2 } = await loadFixture(deployBet));
    });

    async function placeBet(
      account: HardhatEthersSigner,
      option = OPTION_INDEX,
      amount = AMOUNT
    ) {
      return bet.connect(account).bet(option, { value: amount });
    }

    it("Should allow the owner to declare a winner", async () => { 
      await placeBet(owner);
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);
      expect(await bet.status()).to.equal(3); // Status.Finished is 3
    });

    it("Should not allow the owner to declare a winner if there are no winning bets", async () => {
      await bet.connect(owner).close();
      await expect(bet.connect(owner).setWinner(OPTION_INDEX)).to.be.revertedWith("No winning bets");
    });

    it("Should not allow the owner to declare a winner if the event is not closed", async () => {
      await expect(bet.connect(owner).setWinner(OPTION_INDEX)).to.be.revertedWith("Betting must be closed to set a winner");
    });

    it("Should not allow the owner to declare a winner if the winning option is invalid", async () => {
      await placeBet(owner);
      await bet.connect(owner).close();
      await expect(bet.connect(owner).setWinner(INVALID_OPTION_INDEX)).to.be.revertedWith("Invalid option");
    });

    it("Should not allow a non-owner to declare a winner", async () => {
      await placeBet(owner);
      await bet.connect(owner).close();
      await expect(bet.connect(otherAccount).setWinner(OPTION_INDEX)).to.be.revertedWithCustomError(bet, "OwnableUnauthorizedAccount").withArgs(otherAccount.address);
    });

    it("Should not allow betting after the winner is declared", async () => {
      await placeBet(owner);
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);
      await expect(bet.connect(otherAccount).bet(OPTION_INDEX, { value: AMOUNT })).to.be.revertedWith(REVERT_BET_CLOSED);
    });

    it("Should not allow cashback after the winner is declared", async () => {
      await placeBet(owner);
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);
      await expect(bet.connect(owner).cashbackBet()).to.be.revertedWith(REVERT_BET_CLOSED);
    });

    it("Should not allow canceling the event after the winner is declared", async () => {
      await placeBet(owner);
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);
      await expect(bet.connect(owner).cancel()).to.be.revertedWith(REVERT_BET_CLOSED);
    });

    it("Should not allow the owner to declare a winner twice", async () => {
      await placeBet(owner);
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);
      await expect(bet.connect(owner).setWinner(OPTION_INDEX)).to.be.revertedWith("Betting must be closed to set a winner");
    });

    it("Should return money to the winning bettors", async () => {
      await placeBet(user1); // user1 bets on option 0 with AMOUNT
      await placeBet(user2, 1, AMOUNT * 2); // user2 bets on option 1 with 2 * AMOUNT
      await placeBet(otherAccount); // otherAccount bets on option 0 with AMOUNT

      // Close and declare winner
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);

      // Check user1's withdrawal and confirm balance changes
      await expect(bet.connect(user1).withdraw()).to.changeEtherBalances(
        [user1, bet],
        [BigInt(AMOUNT * 2), BigInt(-AMOUNT * 2)]
      );

      // Check otherAccount's withdrawal and confirm balance changes
      await expect(bet.connect(otherAccount).withdraw()).to.changeEtherBalances(
        [otherAccount, bet],
        [BigInt(AMOUNT * 2), BigInt(-AMOUNT * 2)]
      )
    });

    it("Should not allow a loser bettor to withdraw money", async () => {
      await placeBet(user1); // user1 bets on option 0 with AMOUNT
      await placeBet(user2, 1, AMOUNT * 2); // user2 bets on option 1 with 2 * AMOUNT

      // Close and declare winner
      await bet.connect(owner).close();
      await bet.connect(owner).setWinner(OPTION_INDEX);

      await expect(bet.connect(user2).withdraw()).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Get bet", () => {
    it("Should return the bet of the user", async () => {
      const { bet, otherAccount } = await loadFixture(deployBet);
      await bet.connect(otherAccount).bet(OPTION_INDEX, { value: AMOUNT });
      expect(await bet.connect(otherAccount).getBet()).to.deep.equal([OPTION_INDEX, AMOUNT]);
    });

    it("Should return an empty array if the user has not bet", async () => {
      const { bet, otherAccount } = await loadFixture(deployBet);
      expect(await bet.connect(otherAccount).getBet()).to.deep.equal([0, 0]);
    });
  })
});
