// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WithdrawalBase.sol";

// pune limita pe optiuni (deocamdata poti pune infinit)

contract Bet is Ownable, WithdrawalBase {
    enum Status {
        Open,
        Closed,
        Canceled,
        Finished
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

    event BetPlaced(
        address indexed bettor,
        uint option,
        uint amount
    );
    event BetClosed();
    event BetCanceled();
    event DeclaredWinner(uint option);
    event CashbackEvent(address indexed bettor, uint amount);
    event PayoutEvent(address indexed bettor, uint amount);

    constructor(
        string memory _name,
        string[] memory _options,
        address _betCreator
    ) Ownable(msg.sender) {
        require(_options.length > 1, "At least 2 options required");
        require(_options.length <= 8, "Maximum 8 options allowed");
        status = Status.Open;
        name = _name;
        options = _options;
        transferOwnership(_betCreator);
    }

    modifier canPlaceBet(uint _option) {
        require(status == Status.Open, "Betting is closed");
        require(_option < options.length, "Invalid option");
        require(msg.value > 0, "Value must be greater than 0");
        require(bets[msg.sender].amount == 0, "You already bet");
        _;
    }

    // Fallback function in case ether is sent anonymously
    // function () external payable {

    // }

    function getName() public view returns (string memory) {
        return name;
    }

    function getOptions() public view returns (string[] memory) {
        return options;
    }

    function getStatus() public view returns (Status) {
        return status;
    }

    function getPayouts() public view returns (address[] memory, uint[] memory) {
        address[] memory bettorsArray = new address[](bettors.length);
        uint[] memory balancesArray = new uint[](bettors.length);

        for (uint i = 0; i < bettors.length; i++) {
            bettorsArray[i] = bettors[i];
            balancesArray[i] = balances[bettors[i]];
        }

        return (bettorsArray, balancesArray);
    }

    function getBets() public view returns (address[] memory, uint[] memory, uint[] memory) {
        address[] memory bettorsArray = new address[](bettors.length);
        uint[] memory optionsArray = new uint[](bettors.length);
        uint[] memory amountsArray = new uint[](bettors.length);

        for (uint i = 0; i < bettors.length; i++) {
            bettorsArray[i] = bettors[i];
            optionsArray[i] = bets[bettors[i]].option;
            amountsArray[i] = bets[bettors[i]].amount;
        }

        return (bettorsArray, optionsArray, amountsArray);
    }

    function bet(uint _option) external payable canPlaceBet(_option) {
        bets[msg.sender] = BetRecord(_option, msg.value);
        bettors.push(msg.sender);

        emit BetPlaced(msg.sender, _option, msg.value);
    }

    function setWinner(uint _winningOption) public onlyOwner {
        require(status == Status.Closed, "Betting must be closed to set a winner");
        require(_winningOption < options.length, "Invalid option");

        status = Status.Finished;
        emit DeclaredWinner(_winningOption);
        distributeRewards(_winningOption);
    }

    function distributeRewards(uint _winningOption) private {
        uint totalWinningAmount = 0;

        // Calculate total bet amount for the winning option
        for (uint i = 0; i < bettors.length; i++) {
            if (bets[bettors[i]].option == _winningOption) {
                totalWinningAmount += bets[bettors[i]].amount;
            }
        }

        uint totalAmount = address(this).balance;

        // Distribute rewards to winners
        for (uint i = 0; i < bettors.length; i++) {
            if (bets[bettors[i]].option == _winningOption) {
                uint payout = calculatePayout(
                    bets[bettors[i]].amount,
                    totalAmount,
                    totalWinningAmount
                );
                _updateBalance(bettors[i], payout);
                emit PayoutEvent(bettors[i], payout);
            }
        }
    }

    function calculatePayout(uint betAmount, uint totalAmount, uint totalWinningAmount) public pure returns (uint) {
        return (betAmount * totalAmount) / totalWinningAmount;
    }

    function getBet() external view returns (uint, uint) {
        BetRecord memory betRecord = bets[msg.sender];
        return (betRecord.option, betRecord.amount);
    }

    function close() public onlyOwner {
        require(status == Status.Open, "Betting is closed");
        status = Status.Closed;
        emit BetClosed();
    }

    function cancel() public onlyOwner {
        require(status == Status.Open, "Betting is closed");

        status = Status.Canceled;
        restoreFunds();

        emit BetCanceled();
    }

    // function to return the bet amount to the bettor if the bet was canceled
    function restoreFunds() private {
        for (uint i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];
            uint amount = bets[bettor].amount;
            
            _updateBalance(bettor, amount);
            emit PayoutEvent(bettor, amount);
        }
    }

    function cashbackBet() external {
        require(status == Status.Open, "Betting is closed");
        require(bets[msg.sender].amount > 0, "You didn't bet");

        uint amount = bets[msg.sender].amount;
        delete bets[msg.sender];

        payable(msg.sender).transfer(amount);

        emit CashbackEvent(msg.sender, amount);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
