// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import { MyHealth } from "../contracts/MyHealth.sol";

/// @dev Despliegue recomendado en Monad: `forge script` (no `forge create` puro)
contract DeployMyHealthScript is Script {
    function run() external {
        string memory a = "";
        string memory c = "";
        string memory m = "";
        vm.startBroadcast();
        MyHealth deployed = new MyHealth(a, c, m);
        console.log("MyHealth desplegado en:", address(deployed));
        vm.stopBroadcast();
    }
}
