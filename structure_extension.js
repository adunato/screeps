StructureContainer.prototype.transfer = function (target, resourceType) {
    var res = target.withdraw(this, resourceType);
    console.log('StructureContainer.prototype.transfer: ' + res);
    return res;
};
