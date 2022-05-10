//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SharedWallet {
    address public walletOwner;
    mapping(address => uint256) public participantBalance;
    uint256 public totalBalance;

    constructor() {
        walletOwner = msg.sender;
    }

    function depositMoney() public payable{
        require(msg.value != 0, "Cant deposit 0 Eth");
        participantBalance[msg.sender] += msg.value;
        totalBalance += msg.value;
    }

    function payoutMoney(address payable _to, uint256 _amount) public {
        require(msg.sender == walletOwner, "You need to be the wallet owner to payout money");
        require(_amount <= totalBalance, "Shared Wallet doesnt have enough money in it");
        totalBalance -= _amount;
        _to.transfer(_amount);
    }

    function getWalletBalance() public view returns (uint256){
        return totalBalance;
    }

    function getParticipantBalance() public view returns (uint256){
        return participantBalance[msg.sender];
    }
}
