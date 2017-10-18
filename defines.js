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
const UPGRADE_MIN_LIMIT = 50000;

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
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY],
                    // [MOVE, MOVE,MOVE, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, WORK, CARRY]
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
                [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
                [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY]
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, CARRY, CARRY],
                // [MOVE, MOVE, WORK, CARRY],
            ],
            "upgrader_mobile": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY]
            ],
            "repairer": [
                // [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, WORK, WORK, WORK, CARRY],
            ],
            "wall_repairer": [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
            "carrier": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
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
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "transporterXXS": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            ],
            "transporterXL": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            ],
            "transporterXXL": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            ],
            "feeder": [
                // [MOVE, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
                // [MOVE, CARRY]
            ],
            "tower_feeder": [
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "defender": [
                [MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
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
                [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK],
                // [MOVE,ATTACK],
            ],
            "breacher": [
                [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,]
                // [TOUGH,MOVE,MOVE,ATTACK],
            ],
            "assaulter": [
                [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE,],
            ],
            "medic": [
                [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL]
            ],
            "supporter": [
                [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,]
            ],


        };
        global.creepRoles = {
            "feeder": roleFeeder,
            "tower_feeder": roleTowerFeeder,
            "patroller": rolePatroller,
            "harvester": roleHarvester,
            "transporterXXL": roleTransporter,
            "transporterXL": roleTransporter,
            "transporter": roleTransporter,
            "transporterXXS": roleTransporter,
            "repairer": roleRepairer,
            "builder": roleBuilder,
            "collector": roleCollector,
            "upgrader": roleUpgrader,
            "carrier": roleCarrier,
            "wall_repairer": roleWall_repairer,
            "defender": roleDefender,
            "claimer": roleClaimer,
            "reserver": roleReserver,
            "breacher": roleBreacher,
            "assaulter": roleAssaulter,
            "medic": roleMedic,
            "supporter": rolePatroller,
            "upgrader_mobile": roleUpgrader,
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
                if (room)
                    return room.find(FIND_CONSTRUCTION_SITES).length > 0;
                else
                    return false;
            }),
            "UP": new squadprofile.SquadAttributes([["upgrader", 1]], false, function (flagName) {
                var room = Game.flags[flagName].room;
                var storageWithEnergy = room.find(FIND_STRUCTURES, {
                    filter: (container) => {
                        return (container.structureType == STRUCTURE_STORAGE) && container.store.energy > UPGRADE_MIN_LIMIT;
                    }
                });

                return storageWithEnergy.length > 0 || Game.rooms[room.name].controller.ticksToDowngrade < 3000;
            }),
            "UPM": new squadprofile.SquadAttributes([["upgrader_mobile", 1]], true, function (roomName) {
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
                for (var i = 0; i < hostileCreeps.length; i++) {
                    if (hostileCreeps[i].owner.username !== "Invader") {
                        Game.notify("Detected hostile from " + hostileCreeps[i].owner.username + "in room " + room.name, 10);
                        return true;
                    }
                }
                return false;
            }),
            "TR": new squadprofile.SquadAttributes([["transporter", 1]], false, function (roomName) {
                return true
            }),
            "TRXXS": new squadprofile.SquadAttributes([["transporterXXS", 1]], false, function (roomName) {
                return true
            }),
            "TRXL": new squadprofile.SquadAttributes([["transporterXL", 1]], false, function (roomName) {
                return true
            }),
            "TRXXL": new squadprofile.SquadAttributes([["transporterXXL", 1]], false, function (roomName) {
                return true
            }),
            "PA": new squadprofile.SquadAttributes([["patroller", 1]], true, function (roomName) {
                return true
            }),
            "CL": new squadprofile.SquadAttributes([["claimer", 1]], false, function (flagName) {
                var room = Game.flags[flagName].room;
                return !(room && room.controller && room.controller.my);
            }),
            "RES": new squadprofile.SquadAttributes([["reserver", 1]], false, function (flagName) {
                var roomName = Game.flags[flagName].room;
                if (roomName)
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
            "AS": new squadprofile.SquadAttributes([["assaulter", 2], ["medic", 0], ["supporter", 1]], false, function () {
                return true
            }),
        };
        global.allowedToSpawnWithdraw = false;
        global.linksToFeed = {
            "E58N3": [
                '59c2c326af66417dd46b465d',
            ],
            "E59N3": [
                '59bf841899b3c942fd9651ab',
            ],
        };
        global.linkTransfers = {
            "E59N3": [
                '59bf841899b3c942fd9651ab',//from
                '59d736907f2e9a5736c92746',//to
            ],
            "E58N3": [
                '59c2c326af66417dd46b465d',//from
                '59c2d0b36fb4752c7ed7b3fb',//to
            ],
        };
        global.sourceContainers = {
            "E59N3": [
                '59d5f9dc75e131412ef7a35b',//top source
                '59d5efd99c000957040987cd',//bottom source
                '59bf841899b3c942fd9651ab',//central link
                '59c2a37624ea0a1cabd02ee1',//right container
            ],
            "E58N3": [
                '59d5f142c6746a0921a82b91',//bottom source
                '59d5ed5ce5c7e839ea74b37c',//top source
                '59d603fa252d840a77cb2a09',//left container
            ],
            "E59N4": [
                '59d6124fa3a93c60aa6519f6',//top source
                '59d609a371e4794a1d3cd5ba',//bottom source
            ],
            "E57N3": [
                '59d61ced670b8869bf774d3e',//right source
                '59d639603f45520ef70c5686', //left source
            ],
            "E59N2": [
                '59c27bfdaf77cb2f886e312d',//source
                '59c3b4cf1f24c948e65fdf1d',//container
            ],
            "E57N2": [
                '59c0c61d4cda8e77d7942a30',//source
            ],
            "E60N2": [
                '59c2983381b1de1ceacd59b1',//source
            ],
            "E60N3": [
                '59c384517410941e06408ba7',//storage
            ],
            "E56N3": [
                '59c221a8881b657d8937e402',//source
            ],
            "E59N1": [
                '59c2bc9ca105d01f253794a2',//source left
                '59d1fa1bd1169a1a562f83a4',//source right
            ],
            "E55N2": [
                '59d8b1c944dff0121b11987a',//source
            ],
            "E55N1": [
                '59dc9c705f76163cc66d3d94',//source left
                '59dca791ce6ed66a11e78ff2',//source right
            ],
            "E54N2": [
                '59de363b829e7002183191e8',//source
            ],
        };
        global.destinationContainers = {
            "E59N3": [
                // '59bf841899b3c942fd9651ab', //RC
            ],
            "E58N3": [
                '59c2c326af66417dd46b465d',//central link
            ],
            "E59N4": [
                '59bf8f196e7bf95f7b3ba06e',//top link in E59N3
                '59d5f9dc75e131412ef7a35b',//top source in E59N3
            ],
            "E57N3": [
                '59d603fa252d840a77cb2a09',//E58N3 (container)
                '59be700aa68b175c2b15aded',//E58N3 (storage)
            ],
            "E59N2": [
                '59c2983381b1de1ceacd59b1',//E60N2
            ],
            "E57N2": [
                '59c02064576fbe1d3bc87869',//E57N3
            ],
            "E60N2": [
                '59c384517410941e06408ba7',//E60N3
            ],
            "E60N3": [
                '59c2a37624ea0a1cabd02ee1',//E59N3
            ],
            "E56N3": [
                '59c17731b9938460d545528c',//E57N3
            ],
            "E59N1": [
                '59c27bfdaf77cb2f886e312d',//E59N2
            ],
            "E55N2": [
                '59d8bc9c5085375cdfce8740',//RC
            ],
            "E55N1": [
                '59d8b1c944dff0121b11987a',//E55N2
            ],
            "E54N2": [
                '59de7a8733e1850f93fe8fa9',//RC
            ],
        };
    }

};

module.exports = defines;
