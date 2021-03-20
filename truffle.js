var HDWalletProvider = require("truffle-hdwallet-provider");
module.exports = {
  contracts_build_directory: "./Web-client/src/contracts",
   networks: {
   development: {
   host: "127.0.0.1",
   port: 7545,
   network_id: "5777" // Match any network id
  },
  azure: {
   provider: new HDWalletProvider("sand useless seed program lizard mushroom asthma palm knee resemble invite game","http://ethyn4v5d-dns-reg1.eastus.cloudapp.azure.com:8540"),
   network_id: "*",
   gasPrice:0
 },
 }
};
