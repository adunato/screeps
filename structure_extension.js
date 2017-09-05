StructureContainer.prototype.transfer = function (creep, resourceType) {
    return creep.withdraw(this, resourceType);
};
