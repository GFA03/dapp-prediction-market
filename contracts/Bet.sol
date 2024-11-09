// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bet is Ownable {
    enum Status {
        Open,
        Closed,
        Canceled
    }

    struct BetRecord {
        uint option;
        uint amount;
    }

    Status public status;
    string public name;
    string[] public options;
    // mapping from adress to option index and amount
    mapping(address => BetRecord) public bets;
    address[] public bettors;
    mapping(address => bool) public refunded; // Track refunded bettors

    event BetEvent(
        address indexed bettor,
        uint indexed option,
        uint indexed amount
    );
    event CloseEvent();
    event CancelEvent();
    event CashbackEvent(address indexed bettor, uint indexed amount);
    event WinnerEvent(address indexed winner, uint indexed amount);

    constructor(
        string memory _name,
        string[] memory _options
    ) Ownable(msg.sender) {
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
        require(msg.value > 0, "Invalid amount");
        require(bets[msg.sender].amount == 0, "You already bet");

        bets[msg.sender] = BetRecord(_option, msg.value);
        bettors.push(msg.sender);

        emit BetEvent(msg.sender, _option, msg.value);
    }

    function distributeRewards(uint _winningOption) public onlyOwner {
        require(status == Status.Closed, "Betting must be closed to set a winner");
        require(_winningOption < options.length, "Invalid option");
        
        uint totalWinningAmount = 0;

        // Calculate total bet amount for the winning option
        for (uint i = 0; i < bettors.length; i++) {
            if (bets[bettors[i]].option == _winningOption) {
                totalWinningAmount += bets[bettors[i]].amount;
            }
        }

        // Distribute rewards to winners
        for (uint i = 0; i < bettors.length; i++) {
            if (bets[bettors[i]].option == _winningOption) {
                uint payout = (bets[bettors[i]].amount * address(this).balance) / totalWinningAmount;
                payable(bettors[i]).transfer(payout);
            }
        }
    }

    function getBet() public view returns (uint, uint) {
        BetRecord memory betRecord = bets[msg.sender];
        return (betRecord.option, betRecord.amount);
    }

    function close() public onlyOwner {
        require(status == Status.Open, "Betting is closed");
        status = Status.Closed;
        emit CloseEvent();
    }

    // function to return the bet amount to the bettor if the bet was canceled
    function restoreFunds() private onlyOwner {
        require(status == Status.Canceled, "Betting is not canceled");

        for (uint i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];
            BetRecord memory betRecord = bets[bettor];
            payable(bettor).transfer(betRecord.amount);

            emit CashbackEvent(bettor, betRecord.amount);
        }
    }

    function cancel() public onlyOwner {
        require(status == Status.Open, "Betting is closed");

        status = Status.Canceled;

        restoreFunds();

        emit CancelEvent();
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
