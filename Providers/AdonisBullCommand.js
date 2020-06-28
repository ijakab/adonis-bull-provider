"use strict";

const { ServiceProvider } = require("@adonisjs/fold");

class AdonisBullCommand extends ServiceProvider {
  register() {
    this.app.bind("Queue/Commands/Bull:Listen", () =>
      require("../src/Commands/Listen")
    );
  }

  boot() {
    const ace = require("@adonisjs/ace");
    ace.addCommand("Queue/Commands/Bull:Listen");
  }
}

module.exports = AdonisBullCommand;
