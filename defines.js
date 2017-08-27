var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleNomadHarvester = require('role.nomad_harvester');
var defines = {

    initDefines: function () {
        global.minSpawn = {
            "harvester": 1,
            "builder": 1,
            "nomad_harvester": 0,
            "upgrader": 0
        };
        global.bodyParts = {
            "harvester": [WORK,CARRY,MOVE],
            "builder": [WORK,CARRY,MOVE],
            "nomad_harvester": [WORK,CARRY,MOVE],
            "upgrader": [WORK,CARRY,MOVE]
        };
        global.modules = {
            "harvester": roleHarvester,
            "builder": roleBuilder,
            "nomad_harvester": roleNomadHarvester,
            "upgrader": roleUpgrader
        };
    }

}

module.exports = defines;