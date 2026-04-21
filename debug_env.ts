import "dotenv/config";
console.log("Env keys starting with G:", Object.keys(process.env).filter(k => k.startsWith("G")));
console.log("Env keys starting with V:", Object.keys(process.env).filter(k => k.startsWith("V")));
