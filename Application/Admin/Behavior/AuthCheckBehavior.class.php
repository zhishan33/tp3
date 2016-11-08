<?php
namespace Home\Behavior;
use Think\Behavior;
/**
 * 
 */
class AuthCheckBehavior extends Behavior {
	
	function run(&$return) {
		if (C('USER_AUTH_ON')) {
		    
		}
	}
}
	//B('Home\Behavior\AuthCheck');
