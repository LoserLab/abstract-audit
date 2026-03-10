// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Factory {
    event Deployed(address addr);

    // Critical: callcode
    function unsafeCall(address target, bytes memory data) external {
        assembly {
            let success := callcode(gas(), target, 0, add(data, 0x20), mload(data), 0, 0)
        }
    }

    // Critical: extcodecopy
    function copyCode(address target) external view returns (bytes memory) {
        uint256 size;
        assembly {
            size := extcodesize(target)
        }
        bytes memory code = new bytes(size);
        assembly {
            extcodecopy(target, add(code, 0x20), 0, size)
        }
        return code;
    }

    // Moderate: CREATE2 in assembly
    function deploy(bytes memory bytecode, bytes32 salt) external returns (address addr) {
        assembly {
            addr := CREATE2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        emit Deployed(addr);
    }

    // High: prevrandao
    function getRandom() external view returns (uint256) {
        return block.prevrandao;
    }
}