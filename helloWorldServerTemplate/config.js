var fs = require('fs');
var async = require('async');
var colors = require('colors');
var HOTSPOTMODE = "HOTSPOTMODE";
var redis = require("redis"),
client = redis.createClient();

exports.toHotspot = function () {
	async.parallel([
		function(callback){
			fs.readFile('./files/daemonON.txt', function (err, data) {
				if (err) throw err;
				console.log('writing daemon file /etc/default/hostapd');
				fs.writeFile('/etc/default/hostapd', data, function(err) {
					if (err) throw err;
					console.log('DAEMON configured'.green);
					callback(null);
				});
			});
		}, function (callback) {
			fs.readFile('./files/ifaceHotspot.txt', function (err, data) {
				if (err) throw err;
				console.log('writing interfaces file /etc/network/interfaces');
				fs.writeFile('/etc/network/interfaces', data, function (err){
					if (err) throw err;
					console.log('interface configured for Hotspot'.green);
					callback(null);
				});
			});
		}, function (callback) {
			fs.readFile('./files/enabledUDHCPD.txt', function (err, data) {
				if (err) throw err;
				console.log('writing UDHCP file /etc/default/udhcpd');
				fs.writeFile('/etc/default/udhcpd', data, function (err) {
					if (err) throw err;
					console.log('UDHCPD enabled'.green);
					callback(null);
				});
			});
	}],// optional callback
	function(err, results){
		if (err) throw err;
		client.set(HOTSPOTMODE, 1);
		console.log('config files updated, rebooting...');
		reboot();
	});
}

exports.toConnected = function (SSID, password) {

	async.parallel([
		function(callback){
			fs.readFile('./files/daemonOFF.txt', function (err, data) {
				if (err) throw err;
				console.log('writing daemon file /etc/default/hostapd');
				fs.writeFile('/etc/default/hostapd', data, function(err) {
					if (err) throw err;
					console.log('DAEMON configured'.green);
					callback(null);
				});
			});
		}, function (callback){
			fs.readFile('./files/ifaceWifi.txt', function (err, data) {
				if (err) throw err;
				console.log('writing interfaces file /etc/network/interfaces');
				fs.writeFile('/etc/network/interfaces', data, function (err){
					if (err) throw err;
					console.log('interface configured for Hotspot'.green);
					fs.appendFileSync('/etc/network/interfaces', '\twpa-ssid "' + SSID + '"\n', function (err) {
						if (err) throw err;
						console.log('The "data to append" was appended to file!');
					});
					fs.appendFileSync('/etc/network/interfaces', '\twpa-psk "' + password + '"\n', function (err) {
						if (err) throw err;
						console.log('The "data to append" was appended to file!');
					});

					callback(null);
				});
			});   
		}, function (callback){
			fs.readFile('./files/disabledUDHCPD.txt', function (err, data) {
				if (err) throw err;
				console.log('writing UDHCP file /etc/default/udhcpd');
				fs.writeFile('/etc/default/udhcpd', data, function (err) {
					if (err) throw err;
					console.log('UDHCPD enabled'.green);
					callback(null);
				});
			});
		}],
	// optional callback
	function(err, results){
		if (err) throw err;
		client.set(HOTSPOTMODE, 0);
		console.log('config files updated, rebooting...');
		reboot();
	});
}

function reboot() {
	var spawn = require('child_process').spawn,
	ls    = spawn('reboot');

	ls.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	ls.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});

	ls.on('close', function (code) {
		console.log('child process exited with code ' + code);
	});
}
