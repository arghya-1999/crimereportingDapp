const ComplainantReport = artifacts.require("ComplainantReport");

module.exports = function(deployer) {
  deployer.deploy(ComplainantReport);
};
