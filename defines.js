var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleCarrier = require('role.carrier');
var roleCollector = require('role.collector');
var roleNomadHarvester = require('role.nomad_harvester');


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.contains = function ( value ) {
    for (var i in this) {
        if (this[i] == value) return true;
    }
    return false;
};

var defines = {

    initDefines: function () {
        global.bodyParts = {
            "harvester": [WORK, CARRY, MOVE],
            "builder": [WORK, CARRY, MOVE],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [WORK, CARRY, MOVE],
            "repairer": [WORK, CARRY, MOVE],
            "carrier": [CARRY, MOVE],
            "collector": [CARRY, MOVE]
        };
        global.creepRoles = {
            "harvester": roleHarvester,
            "builder": roleBuilder,
            "nomad_harvester": roleHarvester,
            "upgrader": roleUpgrader,
            "repairer": roleRepairer,
            "carrier": roleCarrier,
            "collector": roleCollector
        };
        global.squadProfiles = {
            "H" : [["harvester",7]],
            "B" : [["builder",1]],
            "U" : [["upgrader",1]],
            "R" : [["repairer",1]],
            "CA" : [["carrier",1]],
            "CO" : [["collector",1]],
        };
        global.allowedToSpawnWithdraw = false;
    }

};

module.exports = defines;