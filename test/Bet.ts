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
        const name = 'Test Bet';
        const options = ['Option 1', 'Option 2'];
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const bet = await hre.ethers.deployContract("Bet", [name, options]);
        return { bet, name, options, owner, otherAccount };
    }

    describe("Deployment", () => {
        it("Should deploy correctly with the right address, owner, status, name, and options", async () => {
            const { bet, name, options, owner } = await loadFixture(deployBet);
            expect(await bet.getAddress()).to.properAddress;
            expect(await bet.owner()).to.equal(owner.address);
            expect(await bet.status()).to.equal(0);  // Status.Open is 0
            expect(await bet.name()).to.equal(name);
            expect(await bet.getOptions()).to.deep.equal(options);
        });
    });

    describe("Betting", () => {
        let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;

        beforeEach(async () => {
            ({ bet, owner, otherAccount } = await loadFixture(deployBet));
        });

        async function placeBet(account: HardhatEthersSigner, option = OPTION_INDEX, amount = AMOUNT) {
            return bet.connect(account).bet(option, { value: amount });
        }

        it("Should allow a single bet and update the balance", async () => {
            await placeBet(otherAccount);
            expect(await bet.getBalance()).to.equal(AMOUNT);
        });

        it("Should not allow betting multiple times by the same account", async () => {
            await placeBet(otherAccount);
            await expect(placeBet(otherAccount)).to.be.revertedWith(REVERT_ALREADY_BET);
        });

        it("Should revert on multiple bets with different options", async () => {
            await placeBet(otherAccount);
            await expect(placeBet(otherAccount, 1)).to.be.revertedWith(REVERT_ALREADY_BET);
        });

        it("Should revert if betting is closed", async () => {
            await bet.connect(owner).close();
            await expect(placeBet(otherAccount)).to.be.revertedWith(REVERT_BET_CLOSED);
        });

        it("Should revert for invalid option", async () => {
            await expect(placeBet(otherAccount, INVALID_OPTION_INDEX)).to.be.revertedWith(REVERT_INVALID_OPTION);
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
            await expect(placeBet(otherAccount)).to.be.revertedWith(REVERT_BET_CLOSED);
        });

    });

    describe("Withdrawing", () => {
        let bet: Bet, owner: HardhatEthersSigner, otherAccount: HardhatEthersSigner;

        beforeEach(async () => {
            ({ bet, owner, otherAccount } = await loadFixture(deployBet));
        });

        async function placeBet(account: HardhatEthersSigner, option = OPTION_INDEX, amount = AMOUNT) {
            return bet.connect(account).bet(option, { value: amount });
        }

        it("Should allow a bettor to withdraw their bet", async () => {
            const provider = hre.ethers.provider;
            await placeBet(otherAccount);
            const postBetBalance = await provider.getBalance(otherAccount.address);
            
            const tx = await bet.connect(otherAccount).withdrawBet();
            const receipt = await tx.wait();
            const postWithdrawBalance = await provider.getBalance(otherAccount.address);
            if (receipt !== null) {
                const gasUsed = receipt.gasUsed;
                const gasPrice = receipt.gasPrice;
                
                const expectedBalanceAfterWithdraw = postBetBalance + BigInt(AMOUNT) - gasUsed * gasPrice;
                expect(postWithdrawBalance).to.equal(expectedBalanceAfterWithdraw);
            }
        });
        
        it("Should not allow a bettor to withdraw if he has not bet", async () => {
            await expect(bet.connect(otherAccount).withdrawBet()).to.be.revertedWith("You didn't bet");
        })
    })
});
