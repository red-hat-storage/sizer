class Server
    constructor: (@diskType) ->
    maxDisks: 0

    maxCapacity: ->
        @diskType.maxCapacity() * @maxDisks

class BareMetal extends Server
    maxDisks: 8

class AWS extends Server
    maxDisks: 2

class NVMe
    constructor: (vendor) ->
        @vendor = vendor
    capacities: []

    maxCapacity: ->
        Math.max @capacities...

class OneDWPD extends NVMe
    constructor: (vendor) ->
        super(vendor)
        @capacities = switch @vendor
                        when "intel" then [1.92, 3.84, 7.68]
                        when "micron" then [3.84, 7.68, 15.36]
                        else [1.92, 3.84, 7.68, 16.36]

class ThreeDWPD extends NVMe
    capacities: [1.6, 3.2, 6.4, 12.8]

class TLC extends NVMe
    # TODO: Fill out
    capacities: [1, 3, 6, 13]





disk1 = new OneDWPD "intel"
server1 = new BareMetal disk1

targetCapacity = 100
numberOfReplicaGroups = (targetCapacity, serverType) ->
    Math.ceil targetCapacity / serverType.maxCapacity()


remainderStorageCluster = (targetCapacity, serverType) ->
    fullSets = Math.floor targetCapacity / serverType.maxCapacity()
    return targetCapacity - (fullSets * serverType.maxCapacity())

remainderStorageServer = (targetCapacity, diskType) ->
    Math.ceil targetCapacity / diskType.maxCapacity()

console.log "DISK"
console.log "Vendor: #{disk1.vendor}"
console.log "SERVER"
console.log "Maximum capacity of server: #{server1.maxCapacity()} TB"
console.log "Biggest disk in server is #{server1.diskType.maxCapacity()} TB"
console.log "Server disk choices #{server1.diskType.capacities.join " TB, "} TB"

console.log "Necessary replica groups to reach target capacity of #{targetCapacity} TB"
console.log numberOfReplicaGroups targetCapacity, server1

remainderStorageNeeded = remainderStorageCluster targetCapacity, server1

console.log "Storage to be distributed in last storage group is #{remainderStorageNeeded} TB"
console.log "Number of disks in last storage group's servers is #{remainderStorageServer remainderStorageNeeded, server1.diskType}"
