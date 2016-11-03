<?php
namespace Home\Controller;
use Think\Controller;
class FormController extends Controller{
	public function insert(){
		$Form = D('Form');
		if ($Form->create()) {
			$result = $Form->add();
			if ($result) {
				$this->success('数据添加成功!');
			} else {
				$this->error('数据添加失败!');
			}
		} else {
			$this->error($Form->getError());			
		}
		
	}
	public function add(){
		$this->display();
	}
	public function showContent(){
		$this->show("<h1>h1</h1>");
	}
	public function assignT(){
		$array['name'] = "thinkphp";
		$array['email'] = "think@think.com";
		$array['phone'] = "88886666";
		$array['create_time']="1440676289";
		$this->assign($array);
//		$this->show("{$name}[{$email}{$phone}]");
		$this->display();
	}
	public function read($id=0)
	{
		$Form = M('Form');
		$data = $Form->find($id);
		if ($data) {
			$this->assign('data',$data);
		} else {
			$this->error('数据错误');
		}
		$this->display();
	}
	public function lgopera(){
		$User = M('user');
		$result = $User->where('status=1')->order('create_time')->limit(4)->select();
		$result1 = $User->where('id=1')->field('id,name,email')->find();
//		$this->find(3);
//		$result2 = $this->$data();
//		表示获取除了id,type,create_time之外的所有字段。
		$result3 = $User->field('id,type,create_time',true)->select();
		$result4 = $User->field('id')->union('select id from think_form')->union('select id from think_data')->select();
		dump($result4);
		
	}
	public function volist_tag(){
		$Form = M('form');
		$list = $Form->limit(10)->select();
		$userid = $Form->where('id=1')->select();
		$this->assign('list',$list);
		$this->assign('userid',$userid);
		$this->assign('empty','<span class="empty">没有记录</span>');
		$this->display();
	}
	
}
?>