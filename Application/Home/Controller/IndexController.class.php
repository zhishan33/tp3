<?php

namespace Home\Controller;

use Think\Controller;

class IndexController extends Controller {
	public function _initialize() {
		echo "initialize<br/>";
	}
	public function _before_test()
	{
		echo "before test<br/>";
	}
	public function test() {
		echo "test<br/>";
	}
	public function _after_test()
	{
		echo "after test<br/>";
	}
	public function test2() {
		echo "test2";
	}

	public function index_old() {
		// $this->show('<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} body{ background: #fff; font-family: "微软雅黑"; color: #333;font-size:24px} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.8em; font-size: 36px } a,a:hover{color:blue;}</style><div style="padding: 24px 48px;"> <h1>:)</h1><p>欢迎使用 <b>ThinkPHP</b>！</p><br/>版本 V{$Think.version}</div><script type="text/javascript" src="http://ad.topthink.com/Public/static/client.js"></script><thinkad id="ad_55e75dfae343f5a1"></thinkad><script type="text/javascript" src="http://tajs.qq.com/stats?sId=9347272" charset="UTF-8"></script>','utf-8');
		// $this->show('<h1>hello world！ from App</h1>');
		$Data = M('Data');
		$result = $Data -> find(1);
		$this -> assign('result', $result);
		$this -> display();
	}

	public function index() {
		//      $this->show('<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} body{ background: #fff; font-family: "微软雅黑"; color: #333;font-size:24px} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.8em; font-size: 36px } a,a:hover{color:blue;}</style><div style="padding: 24px 48px;"> <h1>:)</h1><p>欢迎使用 <b>ThinkPHP</b>！</p><br/>版本 V{$Think.version}</div><script type="text/javascript" src="http://ad.topthink.com/Public/static/client.js"></script><thinkad id="ad_55e75dfae343f5a1"></thinkad><script type="text/javascript" src="http://tajs.qq.com/stats?sId=9347272" charset="UTF-8"></script>','utf-8');
		//      $this->show('<h2>hello,App</h2>');
		C('TEL','025-6666-6666');//动态配置
		$Tel = C('TELt',null,'default_config');
		$this->assign('Tel',$Tel);
		$this -> display();
	}

	public function add() {
		$User = D('User');
		if ($User -> create()) {
			$result = $User -> add();
			if ($result) {
				$this -> success('注册成功');
			} else {
				$this -> error('注册失败');
			}
		} else {
			//			$data['error'] = $User->getError();
			//			dump($data);
			//			$this->ajaxReturn($data);
			$this -> error($User -> getError());
		}
	}

	public function hello($name = 'thinkphp') {
		// echo "hello,$name";
		$this -> assign('name', $name);
		$this -> display();
	}

	protected function hello2() {
		echo '这是protected方法';
	}

}
