
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var loaderUtils = require("loader-utils");

module.exports = function(fileContent) {

	if (this.cacheable) {
		this.cacheable();
	}
	var allLoadersButThisOne = this.loaders.filter(function (loader) {
		// Loader API changed from `loader.module` to `loader.normal` in Webpack 2.
		return (loader.module || loader.normal) !== module.exports;
	});
	  // This loader shouldn't kick in if there is any other loader
	if (allLoadersButThisOne.length > 0) {
		return fileContent;
	}
	  // Skip .js files
	if (/\.js$/.test(this.resourcePath)) {
		return fileContent;
	}

	var query = loaderUtils.parseQuery(this.query);
	fileContent = query.min === false?fileContent:fileContent.replace(/\n/g, '');
	
	if(/module\.exports\s?=/.test(fileContent)) {
		fileContent = fileContent.replace(/module\.exports\s?=\s?/, '');
	}
	// else fileContent = JSON.stringify(fileContent);

	if(query.deep !== false) fileContent = loadDeep(fileContent, this.query);

	var template = _.template(replaceSrc(fileContent, query.exclude), _.defaults(query, { variable: 'data' }));
	// All templateVariables which should be available
	// @see HtmlWebpackPlugin.prototype.executeTemplate
	var templateVariables = [
		'compilation',
		'webpack',
		'webpackConfig',
		'htmlWebpackPlugin'
	];
	return 'var _ = require(' + loaderUtils.stringifyRequest(this, require.resolve('lodash')) + ');' +
		'module.exports = function (templateParams) {' +
		// Declare the template variables in the outer scope of the
		// lodash template to unwrap them
		templateVariables.map(function (variableName) {
			return 'var ' + variableName + ' = templateParams.' + variableName;
		}).join(';') + ';' +
		// Execute the lodash template
		'return (' + template.source + ')();' +
		'}';
};


function replaceSrc(fileContent, exclude) {
	fileContent = fileContent.replace(/((\<img[^\<\>]*? src)|(\<link[^\<\>]*? href))=\\?[\"\']?[^\'\"\<\>\+]+?\\?[\'\"][^\<\>]*?\>/ig, function(str){
		var reg = /((src)|(href))=\\?[\'\"][^\"\']+\\?[\'\"]/i;
		var regResult = reg.exec(str);
		if(!regResult) return str;
		var attrName = /\w+=/.exec(regResult[0])[0].replace('=', '');
		var imgUrl = regResult[0].replace(attrName+'=', '').replace(/[\\\'\"]/g, '');
		if(!imgUrl) return str; // 避免空src引起编译失败
		if(/^(http(s?):)?\/\//.test(imgUrl)) return str; // 绝对路径的图片不处理
		if(!/\.(jpg|jpeg|png|gif|svg|webp)/i.test(imgUrl)) return str; // 非静态图片不处理
		if(exclude && imgUrl.indexOf(exclude) != -1) return str; // 不处理被排除的
		if(!(/^[\.\/]/).test(imgUrl)) {
			imgUrl = './' + imgUrl;
		}
		return str.replace(reg, attrName+"=\"${require("+JSON.stringify(imgUrl)+")}\"");
	});
	return fileContent;
}


function loadDeep(fileContent, queryStr) {
	return fileContent.replace(/#include\(\\?[\'\"][^\'\"]+\\?[\'\"]\);?/g, function(str){
		var childFileSrc = str.replace(/[\\\'\"\>\(\);]/g, '').replace('#include', '');
		return "\"+require("+JSON.stringify("html-withimg-loader"+queryStr+"!"+childFileSrc)+")+\"";
	});
}

