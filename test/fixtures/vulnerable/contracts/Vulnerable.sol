// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vulnerable {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    // Critical: selfdestruct
    function destroy() external {
        require(msg.sender == owner, "Not owner");
        selfdestruct(payable(owner));
    }

    // High: .transfer()
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // High: .send()
    function withdrawSend(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        bool success = payable(msg.sender).send(amount);
        require(success, "Send failed");
    }

    // High: ecrecover
    function recoverSigner(bytes32 hash, uint8 v, bytes32 r, bytes32 s) external pure returns (address) {
        return ecrecover(hash, v, r, s);
    }

    // High: block.coinbase
    function getCoinbase() external view returns (address) {
        return block.coinbase;
    }

    // High: block.difficulty
    function pseudoRandom() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }

    // Moderate: gasleft()
    function gasCheck() external view returns (uint256) {
        return gasleft();
    }

    // Moderate: tx.origin == msg.sender
    function isEOA() external view returns (bool) {
        return tx.origin == msg.sender;
    }

    // Moderate: extcodesize
    function isContract(address account) external view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
}