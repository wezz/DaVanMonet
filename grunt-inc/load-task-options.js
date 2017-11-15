module.exports = function(_gruntbase_) { 
	let gruntconfig = {};
	const mainconfig = _gruntbase_.mainconfig;
	const grunt = _gruntbase_.grunt;
	const isType = (val, type) => (typeof val === type && (type !== "string" || (type === "string" && val.length > 0)))
	
    if (mainconfig.compilation.compilers.scss["lint"] === true)
	{
		grunt.loadNpmTasks('grunt-sass-lint')
		gruntconfig["sasslint"] = require('./options/sass-lint-options')(_gruntbase_);
	}

	if (typeof mainconfig.compilation["postcss"] === "object")
	{
		gruntconfig["postcss"] = require('./options/postcss-options')(_gruntbase_);
	}

	if (typeof mainconfig.compilation["minifycss"] === "object")
	{
		gruntconfig["cssmin"] =	require('./options/cssmin-options')(_gruntbase_);
	}

	gruntconfig["watch"] = require('./options/watch-options')(_gruntbase_);
	gruntconfig["connect"] = require('./options/connect-options')(_gruntbase_);
	gruntconfig['express'] = require('./options/express-options')(_gruntbase_);
	gruntconfig["copy"] = require('./options/copy-options')(_gruntbase_);
	gruntconfig["clean"] = require('./options/clean-options')(_gruntbase_);
	gruntconfig["less"] = require('./options/less-options')(_gruntbase_);
	gruntconfig["sass"] = require('./options/sass-options')(_gruntbase_);
	gruntconfig["ts"] = require('./options/ts-options')(_gruntbase_);
	gruntconfig["babel"] = require('./options/babel-options')(_gruntbase_);

	if(isType(_gruntbase_.mainconfig.build,"object") &&
		_gruntbase_.mainconfig.build !== null &&
		isType(_gruntbase_.mainconfig.build.mswebdeploy,"object") &&
		_gruntbase_.mainconfig.build.mswebdeploy !== null &&
		isType(_gruntbase_.mainconfig.build.mswebdeploy.package,"string"))
	{
		gruntconfig["mswebdeploy"] = require('./options/mswebdeploy-options')(_gruntbase_);
	}
	
    return gruntconfig;
}