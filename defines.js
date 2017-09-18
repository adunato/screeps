var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWall_repairer = require('role.wall_repairer');
var roleCarrier = require('role.carrier');
var roleCollector = require('role.collector');
var roleFeeder = require('role.feeder');
var roleTowerFeeder = require('role.tower_feeder');
var roleDefender = require('role.defender');
var roleTransporter = require('role.transporter');
var rolePatroller = require('role.patroller');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var roleBreacher = require('role.breacher');
var roleAssaulter = require('role.assaulter');
var roleMedic = require('role.medic');
var squadprofile = require('SquadProfile');


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
            "harvester":
                [
                    // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE,WORK, WORK, WORK, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, MOVE,MOVE, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE,MOVE, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, WORK, CARRY]
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY]
                ],
            "reserver":
                [
                    [MOVE, MOVE, CLAIM, CLAIM],
                ],
            "claimer":
                [
                    [MOVE, CLAIM],
                ],
            "builder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, WORK, CARRY, CARRY],
                // [MOVE, WORK, CARRY]
            ],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [
                [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, CARRY, CARRY],
                // [MOVE, MOVE, WORK, CARRY],
            ],
            "repairer": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, WORK, WORK, CARRY],
            ],
            "wall_repairer": [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
            "carrier": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "collector": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
                // [MOVE, CARRY]
            ],
            "transporter": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "feeder": [
                [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
                // [MOVE, CARRY]
            ],
            "tower_feeder": [
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "defender": [
                [MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK]
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK],
            ],
            "patroller": [
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK]
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK],
                // [MOVE,ATTACK],
            ],
            "breacher": [
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,]
                // [TOUGH,MOVE,MOVE,ATTACK],
            ],
            "assaulter": [
                [TOUGH,ATTACK,ATTACK,MOVE,MOVE,MOVE,],
            ],
            "medic": [
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL]
            ],
            "supporter": [
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,]
            ],


        };
        global.creepRoles = {
            "patroller": rolePatroller,
            "feeder": roleFeeder,
            "tower_feeder": roleTowerFeeder,
            "harvester": roleHarvester,
            "collector": roleCollector,
            "upgrader": roleUpgrader,
            "carrier": roleCarrier,
            "wall_repairer": roleWall_repairer,
            "repairer": roleRepairer,
            "builder": roleBuilder,
            "defender": roleDefender,
            "transporter": roleTransporter,
            "claimer": roleClaimer,
            "reserver": roleReserver,
            "breacher": roleBreacher,
            "assaulter": roleAssaulter,
            "medic": roleMedic,
            "supporter": rolePatroller,
        };
        global.squadProfiles = {
            "FE": new squadprofile.SquadAttributes([["feeder", 1]], false, function () {
                return true;
            }),
            "HA": new squadprofile.SquadAttributes([["harvester", 1]], false, function (roomName) {
                return true
            }),
            "CO": new squadprofile.SquadAttributes([["collector", 1]], false, function (roomName) {
                return true
            }),
            "BU": new squadprofile.SquadAttributes([["builder", 1]], false, function (flagName) {
                var room = Game.flags[flagName].room;
                if(room)
                    return room.find(FIND_CONSTRUCTION_SITES).length > 0;
                else
                    return false;
            }),
            "UP": new squadprofile.SquadAttributes([["upgrader", 1]], false, function (roomName) {
                return true
            }),
            "RE": new squadprofile.SquadAttributes([["repairer", 1]], true, function (roomName) {
                return true
            }),
            "REXS": new squadprofile.SquadAttributes([["repairer", 1]], true, function (roomName) {
                return true
            }),
            "WA": new squadprofile.SquadAttributes([["wall_repairer", 0]], false, function (roomName) {
                return true
            }),
            "CA": new squadprofile.SquadAttributes([["carrier", 1]], false, function (roomName) {
                return true
            }),
            "DE": new squadprofile.SquadAttributes([["defender", 1]], false, function (flagName) {
                var room = Game.flags[flagName].room;
                var hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
                for(var i = 0; i < hostileCreeps.length; i++){
                    if(hostileCreeps[i].owner.username !== "Invader"){
                        Game.notify("Detected hostile from " + hostileCreeps[i].owner.username + "in room " + room.name, 10);
                        return true;
                    }
                }
                return false;
            }),
            "TR": new squadprofile.SquadAttributes([["transporter", 1]], false, function (roomName) {
                return true
            }),
            "PA": new squadprofile.SquadAttributes([["patroller", 1]], true, function (roomName) {
                return true
            }),
            "CL": new squadprofile.SquadAttributes([["claimer", 1]], false, function (roomName) {
                return true
            }),
            "RES": new squadprofile.SquadAttributes([["reserver", 1]], false, function (flagName) {
                var roomName = Game.flags[flagName].room;
                if(roomName)
                    return !Game.rooms[roomName.name].controller.reservation || Game.rooms[roomName.name].controller.reservation.ticksToEnd < 500;
                else
                    return false;
            }),
            "TOFE": new squadprofile.SquadAttributes([["tower_feeder", 1]], false, function () {
                return true
            }),
            "BR": new squadprofile.SquadAttributes([["breacher", 5]], false, function () {
                return true
            }),
            "AS": new squadprofile.SquadAttributes([["assaulter", 1], ["medic", 2], ["supporter", 1]], false, function () {
                return true
            }),
        };
        global.allowedToSpawnWithdraw = false;
        global.sourceContainers = {
            "E59N3": [
                '59bcf1e54bf950778a52e344',//top source
                '59bcf2e30c847c1a83980262',//bottom source
            ],
            "E58N3": [
                '59bd01066a51a26ee9cd9364',//bottom source
                '59bcfdd9093ab25ba5b27adc',//top source
            ],
            "E59N4": [
                '59be3ab3fb91402166aa3c79',//top source
                '59bd173800f18070a06f4942',//bottom source
            ],
            "E57N3": [
                '59bcae046f72fb412e440e6f',//right source
                '59c02064576fbe1d3bc87869',//left source
                '59c02b0d3bd010249212a0f6',//left source n2
            ],
        };
        global.destinationContainers = {
            "E59N3": [
                '59bec0cea322563477fecd7d', //RC
            ],
            "E58N3": [
                // '59bd135153c8315a8c9d9acd',//central
                '59bd0f8e0b35295a9a690686',//RC
            ],
            "E59N4": [
                '59bcf1e54bf950778a52e344',//top source in E59N3
            ],
            "E57N3": [
                '59be700aa68b175c2b15aded',//storage
            ],
        };
    }

};

module.exports = defines;
