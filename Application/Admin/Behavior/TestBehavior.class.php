<?php
namespace Home\Behavior;
class TestBehavior {
	public function run(&$params)
	{
		if (C('TEST_PARAM')) {
			echo 'RUNTEST BEHAVIOR'.$params;
		} 
		
	}
}