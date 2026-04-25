require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const monadRpc = process.env.MONAD_RPC || "https://testnet-rpc.monad.xyz";

module.exports = {
  networks: {
    monadTestnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, monadRpc),
      network_id: 10143,
      gas: 5_000_000,
      gasPrice: 20_000_000_000,
      skipDryRun: true,
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.28",
    },
  },
  contracts_build_directory: "./build/contracts",
};
