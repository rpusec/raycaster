const bytenode = require('bytenode');
const babel = require("@babel/core");
const fs = require('fs');
const pathModule = require('path');

(async () => {
    await readDirectory('./out/raycaster-win32-x64/resources/');

    async function readDirectory(path){
        let fileNames = fs.readdirSync(path);
        for(let fileName of fileNames){
            let newPath = `${path}/${fileName}`;
            
            if(newPath.includes('node_modules')) continue;

            if(fs.lstatSync(newPath).isDirectory()){
                await readDirectory(newPath);
                continue;
            }

            if(pathModule.extname(newPath) !== '.js') continue;

            let code = babel.transform(fs.readFileSync(newPath), {
                compact: false,
                plugins: ["@babel/plugin-transform-modules-commonjs"],
            }).code;
        
            let compiled = await bytenode.compileElectronCode(code);
            fs.writeFileSync(newPath.replace('.js', '.jsc'), compiled, 'utf8');
        }
    }
})();
