var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
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
            "upgrader": [WORK, CARRY, MOVE]
        };
        global.creepRoles = {
            "harvester": roleHarvester,
            "builder": roleBuilder,
            "nomad_harvester": roleHarvester,
            "upgrader": roleUpgrader,
            "repairer": roleRepairer
        };
        global.squadProfiles = {
            "H" : [["harvester",4]],
            "B" : [["builder",1]],
            "U" : [["upgrader",1]],
            "R" : [["repairer",1]]
        };
    }

};

module.exports = defines;