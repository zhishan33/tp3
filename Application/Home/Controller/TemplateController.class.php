<?php
namespace Home\Controller;
use Think\Controller;
/**
 * 
 */
class TemplateController extends Controller {
	
	public function index($value='')
	{
		$name = 'name';
		$this->assign($name,$name);
		$this->display();
	}
}
