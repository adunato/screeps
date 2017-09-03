var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleCarrier = require('role.carrier');
var roleCollector = require('role.collector');
var roleFeeder = require('role.feeder');
var roleNomadHarvester = require('role.nomad_harvester');


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.contains = function (value) {
    for (var i in this) {
        if (this[i] == value) return true;
    }
    return false;
};

var defines = {

    initDefines: function () {
        global.bodyParts = {
            "harvester": [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY],
            "builder": [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY],
            "repairer": [WORK, CARRY, MOVE],
            "carrier": [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
            "collector": [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
            "feeder": [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        };
        global.creepRoles = {
            "harvester": roleHarvester,
            "collector": roleCollector,
            "upgrader": roleUpgrader,
            "carrier": roleCarrier,
            "repairer": roleRepairer,
            "builder": roleBuilder,
            "feeder": roleFeeder
        };
        global.squadProfiles = {
            "HA": [["harvester", 4]],
            "CO": [["collector", 1]],
            "BU": [["builder", 3]],
            "UP": [["upgrader", 1]],
            "RE": [["repairer", 0]],
            "CA": [["carrier", 1]],
            "FE": [["feeder", 1]],
        };
        global.allowedToSpawnWithdraw = false;
    }

};

module.exports = defines;