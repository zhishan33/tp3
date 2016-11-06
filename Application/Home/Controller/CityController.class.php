<?php
namespace Home\Controller;
use Think\Controller;
/**
 * 
 */
class CityController extends Controller {
	
	function _empty($name) {
		$this->city($name);
	}
	public function city($name)
	{
		echo "当前城市".$name;
	}
}
