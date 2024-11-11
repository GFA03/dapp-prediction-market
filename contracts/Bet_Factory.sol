// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./Bet.sol";

contract Bet_Factory {
    Bet[] private _deployedBets;

    event BetCreated(address indexed betAddress);

    function createBet(string memory _name, string[] memory _options) public {
        Bet newBet = new Bet(_name, _options);
        _deployedBets.push(newBet);
        emit BetCreated(address(newBet));
    }

    function getBets(uint256 limit, uint256 offset) public view returns (Bet[] memory) {
        return _deployedBets;
    }

    function betsCount() public view returns(uint256) {
        return _deployedBets.length;
    }
}