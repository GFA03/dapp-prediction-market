// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import "hardhat/console.sol";

contract Bet {
    string public name;
    string[] public options;

    constructor (string memory _name, string[] memory _options) {
        name = _name;
        options = _options;
    }

    function getOptions() public view returns (string[] memory) {
        return options;
    }
}