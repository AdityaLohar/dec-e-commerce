require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts"
  },
  solidity: "0.8.17",
};
