
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const { spawn } = require('child_process');

function GetManifests(config) {
	return {
		firefox: {
			name: config.id,
			description: config.description,
			path: process.execPath,
			type: "stdio",
			allowed_extensions: config.allowed_extensions.firefox
		},
		chrome: {
			name: config.id,
			description: config.description,
			path: process.execPath,
			type: "stdio",
			allowed_origins: config.allowed_extensions.chrome
		}
	}
}


function DarwinInstall() {
	var mode;
	if(process.execPath.startsWith(process.env.HOME))
		mode = "user";
	else
		mode = "system";
	var config;
	try {
		config = JSON.parse(fs.readFileSync(path.resolve(path.dirname(process.execPath),"../config.json"),"utf8"));
	} catch(err) {
		console.error("Cannot read config file:",err);
		process.exit(-1);
		return;
	}

	var { chrome: chromeManifest, firefox: firefoxManifest } = GetManifests(config);
	var manifests;
	if(mode=="user") 
		manifests = [{
			file: process.env.HOME+"/Library/Application Support/Mozilla/NativeMessagingHosts/"+config.id+".json",			manifest: JSON.stringify(firefoxManifest,null,4),
		},{
			file: process.env.HOME+"/Library/Application Support/Google/Chrome/NativeMessagingHosts/"+config.id+".json",
			manifest: JSON.stringify(chromeManifest,null,4),
		},{
			file: process.env.HOME+"/Library/Application Support/Chromium/NativeMessagingHosts/"+config.id+".json",
			manifest: JSON.stringify(chromeManifest,null,4),
		}];
	else
		manifests = [{
			file: "/Library/Application Support/Mozilla/NativeMessagingHosts/"+config.id+".json",
			manifest: JSON.stringify(firefoxManifest,null,4),
		},{
			file: "/Library/Google/Chrome/NativeMessagingHosts/"+config.id+".json",
			manifest: JSON.stringify(chromeManifest,null,4),
		},{
			file: "/Library/Application Support/Chromium/NativeMessagingHosts/"+config.id+".json",
			manifest: JSON.stringify(chromeManifest,null,4),
		}];
	try {
		manifests.forEach((manif)=>{
			fs.outputFileSync(manif.file,manif.manifest,"utf8");
		});
	} catch(err) {
		console.error("Cannot remove manifest file:",err);
		process.exit(-1);
		return;
	}
	var text = config.name+" is ready to be used";
	spawn("/usr/bin/osascript",["-e","display notification \""+
		text+"\" with title \""+config.name+"\""]);
	console.info(text);
}

function DarwinUninstall() {
	var mode;
	if(process.execPath.startsWith(process.env.HOME))
		mode = "user";
	else
		mode = "system";
	var config;
	try {
		config = JSON.parse(fs.readFileSync(path.resolve(path.dirname(process.execPath),"../config.json"),"utf8"));
	} catch(err) {
		console.error("Cannot read config file:",err);
		process.exit(-1);
	}

	var manifests;
	if(mode=="user") 
		manifests = [
			process.env.HOME+"/Library/Application Support/Mozilla/NativeMessagingHosts/"+config.id+".json",			
			process.env.HOME+"/Library/Application Support/Google/Chrome/NativeMessagingHosts/"+config.id+".json",
			process.env.HOME+"/Library/Application Support/Chromium/NativeMessagingHosts/"+config.id+".json"
		];
	else
		manifests = [
			"/Library/Application Support/Mozilla/NativeMessagingHosts/"+config.id+".json",
			"/Library/Google/Chrome/NativeMessagingHosts/"+config.id+".json",
			"/Library/Application Support/Chromium/NativeMessagingHosts/"+config.id+".json"
		];
	try {
		manifests.forEach((file)=>{
			fs.removeSync(file);
		});
	} catch(err) {
		console.error("Cannot remove manifest file:",err);
		process.exit(-1);
	}
	var text = config.name+" manifests have been removed";
	spawn("/usr/bin/osascript",["-e","display notification \""+
		text+"\" with title \""+config.name+"\""]);
	console.info(text);	
}
	
exports.install = () => {
	switch(os.platform()) {
		case "darwin":
			DarwinInstall();
			break;
		default:
			console.error("Auto-install not supported for platform",os.platform());
	}
	process.exit(0);
}

exports.uninstall = () => {
	switch(os.platform()) {
		case "darwin":
			DarwinUninstall();
			break;
		default:
			console.error("Auto-install not supported for platform",os.platform());
	}
	process.exit(0);
}
