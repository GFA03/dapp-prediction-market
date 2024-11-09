// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bet is Ownable{
    enum Status {
        Open,
        Closed,
        Canceled
    }

    struct BetRecord {
        uint option;
        uint amount;
    }

    address public owner;
    Status public status;
    string public name;
    string[] public options;
    // mapping from adress to option index and amount
    mapping (address => BetRecord) public bets;
    address[] public bettors;

    constructor (string memory _name, string[] memory _options) {
        owner = msg.sender;
        status = Status.Open;
        name = _name;
        options = _options;
    }

    function getOptions() public view returns (string[] memory) {
        return options;
    }

    function bet(uint _option) public payable {
        require(status == Status.Open, "Betting is closed");
        require(_option < options.length, "Invalid option");
        require(msg.value > 0, "Value must be greater than 0");
        require(bets[msg.sender].amount == 0, "You already bet");

        if (bets[msg.sender].amount == 0) {
            bettors.push(msg.sender);
        }

        bets[msg.sender] = BetRecord(_option, msg.value);
    }

    function getBet() public view returns (uint, uint) {
        BetRecord memory betRecord = bets[msg.sender];
        return (betRecord.option, betRecord.amount);
    }

    function close() public {
        require(msg.sender == owner, "You aren't the owner");
        require(status == Status.Open, "Betting is closed");

        status = Status.Closed;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

// todo: check for a bettor who cashed back (and remained in the bettors array) to not throw an error when searching in the bets mapping