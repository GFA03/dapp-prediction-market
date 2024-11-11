// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./Bet.sol";

contract Bet_Factory {
    uint256 private _maxLimit = 20;
    Bet[] private _deployedBets;

    event BetCreated(address indexed betAddress);

    function createBet(string memory _name, string[] memory _options) public {
        Bet newBet = new Bet(_name, _options);
        _deployedBets.push(newBet);
        emit BetCreated(address(newBet));
    }

    function getBets(uint256 limit, uint256 offset) public view returns (Bet[] memory coll) {
        // size should be the smaller of the count or the limit
        uint256 size = betsCount() < limit ? betsCount() : limit;

        // size should not exceed the maxLimit
        size = size < _maxLimit ? size : _maxLimit;
        coll = new Bet[](size);
        
        return coll;
    }

    function betsCount() public view returns(uint256) {
        return _deployedBets.length;
    }
}