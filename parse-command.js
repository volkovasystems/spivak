/*:
	@module-configuration:
		{
			"packageName": "spivak",
			"fileName": "parse-command.js",
			"moduleName": "parseCommand",
			"authorName": "Richeve S. Bebedor",
			"authorEMail": "richeve.bebedor@gmail.com",
			"repository": "git@github.com:volkovasystems/spivak.git"
		}
	@end-module-configuration

	@module-documentation:
		
	@end-module-documentation

	@include:
		{
			"fs": "fs",
			"path": "path"
		}
	@end-include
*/
var parseCommand = function parseCommand( command, parseRuleSet ){
	/*:
		@meta-configuration:
			{
				"command:required": "string|List",
				"parseRuleSet:required": "Set"
			}
		@end-meta-configuration
	*/

	if( command instanceof Array ){
		command = command.join( " " );
	}

	//We don't need the executor and the program part.
	if( nodeProgramPattern.test( command ) &&
		nodeExecutorPattern.test( command ) )
	{
		command = command.replace( nodeProgramPattern, "" ).trim( );
	}

	var commandNamespace;
	if( "commandParser" in parseRuleSet &&
		typeof parseRuleSet.commandParser == "function" )
	{
		commandNamespace = parseRuleSet.commandParser( command );

	}else if( "commandPattern" in parseRuleSet &&
		parseRuleSet.commandPattern instanceof RegExp )
	{
		var commandMatchList = command.match( parseRuleSet.commandPattern );
		commandNamespace = commandMatchList[ 1 ] || commandMatchList[ 0 ];
		commandNamespace = commandNamespace.replace( /-[a-z]|\s+?[a-z]/g,
			function onReplace( match ){
				match = match.replace( /-|\s+/, "" );
				return match.toUpperCase( );
			} );

	}else{
		var error = new Error( "command parser or pattern missing" );
		console.error( error );
		throw error;
	}

	if( !commandNamespace ){
		var error = new Error( "cannot determine command namespace due to invalid command format" );
		console.error( error );
		throw error;
	}

	var argumentList;
	if( "argumentListParser" in parseRuleSet && 
		typeof parseRuleSet.argumentListParser == "function" )
	{
		argumentList = parseRuleSet.argumentListParser( command );

	}else if( "argumentListPattern" in parseRuleSet &&
		parseRuleSet.argumentListPattern instanceof RegExp )
	{
		var argumentListMatchList = command.match( parseRuleSet.argumentListPattern );
		argumentList = argumentListtMatchList[ 0 ].split( /\s+/g );
	}

	return {
		"commandNamespace": commandNamespace,
		"argumentList": argumentList
	};
};

var nodeExecutorPattern = /^nodejs|node/;
var nodeProgramPattern = /^[a-z]+\s+.+?\.js/;

( module || { } ).exports = parseCommand;

