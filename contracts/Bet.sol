// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import "hardhat/console.sol";

contract Bet {
    string public name;

    constructor (string memory _name) {
        name = _name;
    }
}