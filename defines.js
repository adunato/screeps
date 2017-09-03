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
            "harvester": [WORK, CARRY, MOVE,WORK,WORK,WORK],
            "builder": [WORK, CARRY, MOVE,WORK,WORK,WORK],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [WORK, CARRY, MOVE,WORK,WORK,WORK],
            "repairer": [WORK, CARRY, MOVE],
            "carrier": [CARRY, MOVE,CARRY, MOVE,CARRY, MOVE,CARRY, MOVE,CARRY, MOVE],
            "collector": [CARRY, MOVE,CARRY, MOVE,CARRY, MOVE,CARRY, MOVE,CARRY, MOVE]
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
            "HA" : [["harvester",4]],
            "BU" : [["builder",1]],
            "UP" : [["upgrader",1]],
            "RE" : [["repairer",1]],
            "CA" : [["carrier",1]],
            "CO" : [["collector",1]],
        };
        global.allowedToSpawnWithdraw = false;
    }

};

module.exports = defines;