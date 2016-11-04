<?php
namespace Home\Widget;
/**
 * 
 */
class MenuWidget extends Think\Controller {
	
	function index($id,$name) {
		echo "menuWidget".$id.':'.$name;
	}
	public function index2()
	{
		$menu = M('Form')->getField('id,title');
		$this->assign('menu',$menu);
		$this->display('Widget/menu');
	}
}
