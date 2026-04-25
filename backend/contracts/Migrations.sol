// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Migrations {
    address public owner = msg.sender;
    uint public lastCompletedMigration;

    modifier restricted() {
        require(msg.sender == owner, "Solo el dueno");
        _;
    }

    function setCompleted(uint completed) public restricted {
        lastCompletedMigration = completed;
    }
}
