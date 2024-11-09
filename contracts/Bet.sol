// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import "hardhat/console.sol";

contract Bet {
    enum Status {
        Open,
        Closed,
        Canceled
    }

    address public owner;
    Status public status;
    string public name;
    string[] public options;

    constructor (string memory _name, string[] memory _options) {
        owner = msg.sender;
        status = Status.Open;
        name = _name;
        options = _options;
    }

    function getOptions() public view returns (string[] memory) {
        return options;
    }
}