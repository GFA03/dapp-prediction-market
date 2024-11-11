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
        require(offset <= betsCount(), "offset out of bounds");
        
        // size is the number of bets left after the offset
        uint256 size = betsCount() - offset;

        // size should be the smaller of the count or the limit
        size = size < limit ? size : limit;

        // size should not exceed the maxLimit
        size = size < _maxLimit ? size : _maxLimit;
        coll = new Bet[](size);

        for (uint256 i = 0; i < size; i++) {
            coll[i] = _deployedBets[offset + i];
        }
        
        return coll;
    }

    function betsCount() public view returns(uint256) {
        return _deployedBets.length;
    }
}