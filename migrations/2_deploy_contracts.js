var Voting = artifacts.require("./Voting.sol");
module.exports = function(deployer) {
  deployer.deploy(Voting, "Mock Election", 1512244900, 1512245900, {gas: 4700000});
};