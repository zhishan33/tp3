<?php
namespace Home\Controller;
use Think\Controller;
use Think\Model;
/**
 * 
 */
class UserController extends Controller {
	
	public function test()
	{
		$event = A('User','Event');
		$event->login();
		//或直接使用
		//R('User/login','','Event');
	}
	public function index()
	{
		$User=M('user');
		$condition['name']='thinkphp';
		$condition['status']=1;
		//SELECT * FROM think_user WHERE name = 'thinkphp' and status=1;
		$result = $User->where($condition)->select();
		//SELECT * FROM think_user WHERE name = 'thinkphp' and status=1;
		$condition1['name']='thinkphp';
		$condition1['status']=1;
		$condition1['_logic']='OR';
		$result = $User->where($condition1)->select();
//		dump($result);
		$condition2['id']=array('neq',2);
		$condition2['id']=array('gt',2);
		$condition2['id']=array('egt',2);
		$condition2['id']=array('lt',2);
		$condition2['id']=array('elt',2);
		$condition3['name']=array('like','thinkphp%');
		$condition3['name']=array('like',array('%thinkphp%','%tp'),'OR');
		$condition3['name']=array('notlike',array('%thinkphp%','%tp'),'and');
		$condition4['id']=array('between',array('1','2'));
		$condition4['id']=array('in',array('1','3'));
		$condition4['id']=array('not in',array('1','3'));
		$condition4['id']=array('exp','IN(1,5,6)');
		$condition5['title|name']='thinkphp';
		$condition6['status&title']=array('1','tp','_multi'=>true);
		$condition6['status&score&title']=array('1',array('lt','60'),'tp','_multi'=>true);
		$condition7['id']=array(array('gt',1),array('lt',5));
		$condition7['id']=array(array('gt',5),array('lt',2),'or');
		//组合查询
		//(`id` !=1) AND (`name`='ok') AND (status=1 AND score>10);
		$condition8['id']=array('neq',1);
		$condition8['name']='ok';
		$condition8['_string']='status=1 AND score>10';
		//`id`>5 AND (`status`='1' OR `score`=100);
		$condition9['id']=array('gt','5');
		$condition9['_query']='status=1&score=100&_logic=or';
		//符合查询
		//(id>1) AND ((name like '%thinkphp%') OR (title like '%thinkphp%'));
		$where['name']=array('like','%thinkphp%');
		$where['title']=array('like','%thinkphp%');
		$where['_logic']='or';
		$condition10['_complex']=$where;
		$condition10['id']=array('gt',1);
		//$where['id']=array('gt',1);
		//$where['_string'] = '(name like "%thinkphp%") OR (title like "%thinkphp%")';
		//统计查询count();max();min();avg();sum();
		$result=$User->where($condition10)->select();
		if ($result) {
			$this->assign('result',$result);
		} else {
			$this->error('数据错误');
		}
		$this->display();
	}
	public function search_TJ()
	{
		$User=M('User');
		$result['userCount']=$User->count();
//		$userCount=$User->count();
//		$userCount="test";
		$result['userCount']=$User->count("id");
		$result['maxScore']=$User->max("score");
		$result['minScore']=$User->where('score'>0)->min('score');
		$result['avgScore']=$User->avg('score');
		$result['sumScore']=$User->sum('score');
		
		$this->assign('result',$result);
		$this->display();
	}
	//SQL查询
	//query方法对应的都是读操作
	//execute方法对应的都是写操作
	public function search_SQL()
	{
		$Model = new Model();
		$result = $Model->query("select * from think_user where status=1");
//		$result1 = $Model->execute("update think_user name='thinkphp' where status=1");
		$this->assign('result',$result);
		$this->display();
		
	}
	//动态查询
	public function search_DT()
	{
		$User = M('User');
		$result = $User->getByName('thinkphp');
		$result1 = $User->getFieldByName('thinkphp','score');
		dump($result1);
		$this->assign('result1',$result1);
		$this->display();
	}
	//子查询
	public function search_sub()
	{
//		当select方法传入false参数的时候，表示不执行当前查询，而只是生成查询SQL
		$subQuery=$model->field('id,name')->table('tablename')->group('field')->where($where)->order('status')->select(false);
//		调用buildSql方法后不会进行实际的查询操作，而只是生成该次查询的SQL语句
		$subQuery=$model->field('id,name')->table('tablename')-group('field')->where($where)->order('status')->buildSql();
		$modle->table($subQuery.'a')->where()->order()->select();
	}
}
