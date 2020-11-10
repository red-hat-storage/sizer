class Server
    constructor: (@diskType) ->
    maxDisks: 0

    maxCapacity: ->
        @diskType.maxCapacity() * @maxDisks

    getInfo: ->
        """
        Maximum capacity of one server: #{@maxCapacity()} TB
        Disk vendor: #{@diskType.vendor}
        Server disk choices #{@diskType.capacities.join " TB, "} TB
        Biggest available disk is #{@diskType.maxCapacity()} TB
        """

class BareMetal extends Server
    maxDisks: 8

class VMware extends Server
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





disk1vendor = "intel"
disk1 = new OneDWPD disk1vendor
server1 = new BareMetal disk1

targetCapacity = 501
numberOfReplicaGroups = (targetCapacity, serverType) ->
    Math.ceil targetCapacity / serverType.maxCapacity()


remainderStorageCluster = (targetCapacity, serverType) ->
    fullSets = Math.floor targetCapacity / serverType.maxCapacity()
    return targetCapacity - (fullSets * serverType.maxCapacity())

remainderStorageServer = (targetCapacity, diskType) ->
    Math.ceil targetCapacity / diskType.maxCapacity()

capacityPlanning = (targetCapacity, serverType) ->
    remainderStorageNeeded = remainderStorageCluster targetCapacity, serverType
    """
    Necessary replica groups to reach target capacity of #{targetCapacity} TB: #{numberOfReplicaGroups targetCapacity, serverType}
    Storage to be distributed in last storage group is approximately #{Math.round((remainderStorageNeeded + Number.EPSILON) * 100) / 100} TB
    Number of disks in last storage group's servers is #{remainderStorageServer remainderStorageNeeded, server1.diskType}
    """

updatePlanning = ->
    resultScreen = $("#resultScreen")[0];
    resultScreen.innerHTML = """
                            *SERVER INFO*
                            #{server1.getInfo()}

                            *CAPACITY PLANNING*
                            #{capacityPlanning targetCapacity, server1}
                            """

updatePlanning()

redoServer = (serverType) ->
    switch serverType
        when "metal" then server1 = new BareMetal disk1
        when "aws" then server1 = new AWS disk1
        when "vmware" then server1 = new VMware disk1

redoDisk = (diskType) ->
    switch diskType
        when "1DPWD" then disk1 = new OneDWPD disk1vendor
        when "3DPWD" then disk1 = new ThreeDWPD disk1vendor
        when "TLC" then disk1 = new TLC disk1vendor
    redoServer($('#platform')[0].value)


$(document).ready ->
    $('#platform').change (event) ->
        redoServer(this.value)
        updatePlanning()

    $('#diskVendor').change (event) ->
        disk1vendor = this.value
        redoDisk($('#diskType')[0].value)
        updatePlanning()

    $('#diskType').change (event) ->
        redoDisk(this.value)
        updatePlanning()

    slider = $("#capacityRange")[0];
    output = $("#rangeValue")[0];
    output.innerHTML = slider.value + " TB"; # Display the default slider value

    # Update the current slider value (each time you drag the slider handle)
    slider.oninput = () ->
        output.innerHTML = this.value + " TB";
        targetCapacity = this.value
        updatePlanning()

