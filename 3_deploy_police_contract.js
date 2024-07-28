const PoliceRegister = artifacts.require("PoliceRegister");

module.exports = function(deployer) {
  deployer.deploy(PoliceRegister);
};
