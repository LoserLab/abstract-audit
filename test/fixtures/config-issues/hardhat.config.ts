import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-deploy";

const config = {
  solidity: "0.8.20",
  zksolc: {
    version: "latest",
  },
};

export default config;