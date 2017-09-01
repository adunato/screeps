var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleNomadHarvester = require('role.nomad_harvester');
var printStats = false;
var defines = {

    initDefines: function () {
        global.minSpawn = {
            "harvester": 1,
            "builder": 0,
            "nomad_harvester": 0,
            "upgrader": 0
        };
        global.bodyParts = {
            "harvester": [WORK, CARRY, MOVE],
            "builder": [WORK, CARRY, MOVE],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [WORK, CARRY, MOVE]
        };
        global.modules = {
            "harvester": roleHarvester,
            "builder": roleBuilder,
            "nomad_harvester": roleHarvester,
            "upgrader": roleUpgrader
        };
        global.squadProfiles = {
            "harvesters" : [["harvester",3], ["builder",1]],
            "builders" : [["builder",3]],
            "upgraders" : [["upgrader",3]]
        };
    }

}

module.exports = defines;