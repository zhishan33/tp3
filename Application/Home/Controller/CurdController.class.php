<?php
namespace Home\Controller;
use Think\Controller;
/**
 * 
 */
class CurdController extends Controller {
	
	public function dataA()
	{
		$Model = M('User');
		$Model->name = "mytest";
		$Model->email = "mytest@test.com";
		$Model->add();
	}
	public function dataFA($value='')
	{
		$Model = M('User');
		$data['name'] = 'zhishan';
		$data['email'] = 'zhishan@test.com';
		$Model->data($data)->add();
	}
	public function dataS()
	{
		$Model = M('User');
		$data['id'] = 35;
		$data['name'] = 'modefy';
		$data['email'] = 'modefy@test.com';
		$Model->data($data)->save();
	}
	public function dataF()
	{
		$Model = M('User');
		$map['name'] = 'zhishan';
		$Model->where($map)->find();
		$data1 = $Model->where($map)->find();
		$data = $Model->data();
		dump($data);
	}
	public function data_Field()
	{
		$Model = M('Form');
		$Model->field(array('id','title','content'))->where('id>15')->select();
		$data1 =  $Model->field(array('id','title','content'))->where('id>15')->select();
//		$data = $Model->data();//无效果
		dump($data1);
	}
	public function data_add()
	{
		$Model = M('User');
		$data['name'] = 'jiangshan';
		$data['email'] = 'jiangshan@test.con';
		$data['test'] = 'test';
		$Model->data($data)->add();
 	}
	public function data_find()
	{
		//find() 方法只返回第一个符合条件数据
		$User = M('User');
		$data = $User->where('status=1 AND name = "thinkphp"')->find();
		dump($data);
	}
	public function data_getfield($value='')
	{
		$User = M('User');
//		$list = $User->limit(5)->getField('id,name,email');
		$list = $User->getField('id,name,email',8);
		dump($list);
	}
}
