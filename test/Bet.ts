import hre from "hardhat";
import { expect } from "chai";


describe("Bet", () => {
    describe("Deployment", () => {
        it("Should deploy correctly", async () => {
            const Bet = await hre.ethers.getContractFactory("Bet");
            const bet = await Bet.deploy();
            
            const addr = await bet.getAddress();
            expect(addr).to.properAddress;
        });
    });
});