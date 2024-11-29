// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

abstract contract WithdrawalBase {
    mapping(address => uint) public balances;

    event WithdrawalEvent(address indexed account);

    function withdraw() public {
        uint amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit WithdrawalEvent(msg.sender);
    }

    function _updateBalance(address account, uint amount) internal {
        balances[account] += amount;
    }

    function _resetBalance(address account) internal {
        balances[account] = 0;
    }

    function getBalance(address account) public view returns (uint) {
        return balances[account];
    }
}
