var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWall_repairer = require('role.wall_repairer');
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
            // "harvester": [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY],
            "harvester":
                [
                    [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                    [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                    [MOVE, MOVE, WORK, CARRY, CARRY]
                ],
            //[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY]
            "builder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY],
                [MOVE, MOVE, WORK, CARRY, CARRY]
            ],
            // "builder": [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, WORK, WORK, CARRY],
            ],
            "repairer": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, WORK, WORK, CARRY],
            ],
            "wall_repairer": [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
            "carrier": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            // "collector": [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
            "collector": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "feeder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            // "feeder": [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        };
        global.creepRoles = {
            "feeder": roleFeeder,
            "harvester": roleHarvester,
            "collector": roleCollector,
            "upgrader": roleUpgrader,
            "carrier": roleCarrier,
            "wall_repairer": roleWall_repairer,
            "repairer": roleRepairer,
            "builder": roleBuilder
        };
        global.squadProfiles = {
            "FE": [["feeder", 1]],
            "HA": [["harvester", 4]],
            "CO": [["collector", 1]],
            "BU": [["builder", 2]],
            "UP": [["upgrader", 0]],
            "RE": [["repairer", 0]],
            "WA": [["wall_repairer", 0]],
            "CA": [["carrier", 1]],
        };
        global.allowedToSpawnWithdraw = false;
    }

};

module.exports = defines;