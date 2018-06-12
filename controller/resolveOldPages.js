const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const tplDir = path.resolve(__dirname, '../templetes');
const cfgDir = path.resolve(__dirname, '../config');

module.exports = function (oldviewsDir) {
	fs.readdir(oldviewsDir, (err, files) => {
		if (err) throw err;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (path.extname(file) === '.html') {
				const filepath = path.resolve(oldviewsDir, file);
				let textObj = {};
				fs.readFile(filepath, {encoding: 'utf-8'}, (err, data) => {
					if (err) throw err;
					const $ = cheerio.load(data, {decodeEntities: false});
					const reg = /(?<=[^/][>])[^<]*(?=<)/img;

					let bodyHtml = $.html('body');
					
					const nodes = bodyHtml.match(reg);

					for (let i = 0; i < nodes.length; i++) {
						const node = nodes[i].trim();
						if (node.length > 0) {
							
							textObj[`c${i}`] = node;
							
							bodyHtml = bodyHtml.replace(node, `{c${i}}`);
						}
					}
					const cfgFile = `module.exports = ${JSON.stringify(textObj)}`;
					let html = $.html().replace($.html('body'),bodyHtml);
					fs.writeFile(path.resolve(tplDir,file.replace('.html','.tpl')),html,(err) =>{
						if (err) throw err;
						console.log(`第${i+1}个模版文件--${file.replace('.html','.tpl')}创建成功!!`);
					});
				
					fs.writeFile(path.resolve(cfgDir,file.replace('.html','.js')),cfgFile,(err) =>{
						if (err) throw err;
						console.log(`第${i+1}个配置文件--${file.replace('.html','.js')}创建成功!!`);
					});
				});
			} else {
				break;
			}

		}
	});
}