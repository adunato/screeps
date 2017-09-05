StructureContainer.prototype.transfer = function (target, resourceType) {
    if(typeof(target) === 'Creep'){
        return target.withdraw(this,resourceType);
    }
};
