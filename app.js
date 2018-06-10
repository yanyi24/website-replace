const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const cfgDir = path.resolve(__dirname, './config');
const viewsDir = path.resolve(__dirname, './views');

const language = 'en'; // 执行程序前请先确认多语言版本

/**
 * 读取模版
 * @param {模板文件的目录 string} fileName 
 */
const getTplFile = function (tpldir) {
	const tplDir = path.resolve(__dirname, tpldir);
	const files = fs.readdirSync(tplDir);
	const filesLen = files.length;
	let tplInfo = [];
	for (let i = 0; i < filesLen; i++) {
		const file = files[i];
		//模板文件以.tpl 结尾
		if (path.extname(file) === '.tpl') {
			const filePath = path.join(tplDir, file);
			let info = {};
			info["fileName"] = path.parse(filePath).name;
			info["fileText"] = fs.readFileSync(filePath, {encoding: 'utf8'});
			tplInfo.push(info);
		}
	}
	return tplInfo;
}
/**
 * 获取对应的配置文件
 * @param {去掉后缀名的文件名 string} fileName 
 */
const getTplCfg = function (fileName,language) {  
	const lan = (language === 'en') ? '' : `.${language}`;
	const selfCfg = require(path.join(cfgDir,`${fileName}${lan}.js`));
	const baseCfg = require(path.join(cfgDir,`base${lan}.js`));
	return Object.assign(selfCfg, baseCfg);
}
/**
 *
 * @param {模板文件的目录 string} tpldir 
 */
const resolvTpl = function (tpldir) {  
	const tplInfo = getTplFile(tpldir);
	for (let i = 0; i < tplInfo.length; i++) {
		const info = tplInfo[i];
		const fileName = info.fileName;
		const fileText = info.fileText;
		console.log(fileName);
		
		let tplCfg = getTplCfg(fileName, language);
		const $ = cheerio.load(fileText);
		let tplHtml = $.html();

		const reg = /(?<=[>|"|'])\{[a-zA-Z]+.*\}(?=[<|"|'])/img; // 匹配形如'{*}'的标识符
		const flags = tplHtml.match(reg);

		for (let i = 0; i < flags.length; i++) {
			const flagText = flags[i].replace('{','').replace('}','');
			tplHtml = tplHtml.replace(flags[i],tplCfg[flagText]);
		}
		fs.writeFile(path.resolve(viewsDir,fileName + '.html'),tplHtml,(err) =>{
			if (err) throw err;
			console.log(`第${i+1}个文件--${fileName}修改成功!!,language为${language}`);
		});
	}
}
resolvTpl( './templetes');
