const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const cfgDir = path.resolve(__dirname, './config');
const viewsDir = path.resolve(__dirname, './views');


/**
 * 读取模版
 * @param {模板文件的目录 string} fileName 
 */
const getTplFile = function (tpldir) {
	const tplDir = path.resolve(__dirname, tpldir);
	const files = fs.readdirSync(tplDir);
	const filesLen = files.length;
	for (let i = 0; i < filesLen; i++) {
		let tplInfo = {};
		const file = files[i];
		//模板文件以.tpl 结尾
		if (path.extname(file) === '.tpl') {
			const filePath = path.join(tplDir, file);
			const fileName = path.parse(filePath).name;
			const fileText = fs.readFileSync(filePath, {encoding: 'utf8'});
			return {fileName, fileText};
		}
	}
}
/**
 * 获取对应的配置文件
 * @param {去掉后缀名的文件名 string} fileName 
 */
const getTplCfg = function (fileName) {  
	return fs.readFileSync(path.join(cfgDir,`${fileName}.json`)).toString();
}
const getFlag = function (html) {  
	return (html.match(/(?<=\{)[a-zA-Z]+.*(?=\})/img));
}	
/**
 *
 * @param {模板文件的目录 string} tpldir 
 */
const resolvTpl = function (tpldir) {  
	const fileName = getTplFile(tpldir).fileName;
	const fileText = getTplFile(tpldir).fileText;
	let tplCfg = JSON.parse(getTplCfg(fileName));
	const $ = cheerio.load(fileText);
	let tplHtml = $.html();
	const flagsText = getFlag(tplHtml);
	const reg = /(?<=[>|"|'])\{[a-zA-Z]+.*\}(?=[<|"|'])/img;
	const flags = tplHtml.match(reg);
	for (let i = 0; i < flags.length; i++) {
		const flagText = flagsText[i];
		
		tplHtml = tplHtml.replace(flags[i],tplCfg[flagText]);
	}
	fs.writeFile(path.resolve(viewsDir,fileName + '.html'),tplHtml,(err) =>{
		if (err) throw err;
		console.log('sucess!!');
	});
}
resolvTpl( './templetes');
