const MyHealth = artifacts.require("MyHealth");

module.exports = function (deployer) {
  const alergias = "";
  const condiciones = "";
  const medicacion = "";
  deployer.deploy(MyHealth, alergias, condiciones, medicacion);
};
