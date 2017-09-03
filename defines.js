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
            "collector": roleCollector,
            "upgrader": roleUpgrader,
            "carrier": roleCarrier,
            "repairer": roleRepairer,
            "builder": roleBuilder
        };
        global.squadProfiles = {
            "HA" : [["harvester",4]],
            "CO" : [["collector",1]],
            "BU" : [["builder",0]],
            "UP" : [["upgrader",0]],
            "RE" : [["repairer",0]],
            "CA" : [["carrier",0]],
        };
        global.allowedToSpawnWithdraw = false;
    }

};

module.exports = defines;