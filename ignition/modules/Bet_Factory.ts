import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Bet_Factory", (m) => {
    const factory = m.contract("Bet_Factory", []);

    return {factory};
});