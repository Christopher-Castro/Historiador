// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var data;
var vector = {
    getInputRegister: function(addr, unitID) {
        // Synchronous handling
        return Promise.resolve(Math.random()*10);
    },
    getHoldingRegister: function(addr, unitID, callback) {
        // Asynchronous handling (with callback)

        setTimeout(function() {
            // callback = function(err, value)
            callback(null, addr + 8000);
        }, 10);
    },
    getCoil: function(addr, unitID) {
        // Asynchronous handling (with Promises, async/await supported)
        return Promise.resolve(Math.round(Math.random()))
    },
    setRegister: function(addr, value, unitID) {
        // Asynchronous handling supported also here
        console.log("set register", addr, value, unitID);
        data=value;
        return;
    },
    setCoil: function(addr, value, unitID) {
        // Asynchronous handling supported also here
        console.log("set coil", addr, value, unitID);
        data=value;
        return;
    },
    readDeviceIdentification: function(addr) {
        return {
            0x00: "MyVendorName",
            0x01: "MyProductCode",
            0x02: "MyMajorMinorRevision",
            0x05: "MyModelName",
            0x97: "MyExtendedObject1",
            0xAB: "MyExtendedObject2"
        };
    }
};
 
// set the server to answer for modbus requests
console.log("ModbusTCP listening on modbus://0.0.0.0:502");
var serverTCP = new ModbusRTU.ServerTCP(vector, { host: "0.0.0.0", port: 502, debug: true, unitID: 1 });
 
serverTCP.on("socketError", function(err){
    // Handle socket error if needed, can be ignored
    console.error(err);
});