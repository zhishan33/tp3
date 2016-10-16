<?php

namespace Home\Controller;

use Think\Controller;

/**
 *
 */
class FormController extends Controller
{
    public function insert()
    {
        $Form = D('Form');
        if ($Form->create()) {
            $result = $Form->add();
            if ($result) {
                $this->success('数据添加成功!');
            } else {
                $this->error('数据添加失败');
            }
        } else {
            $this->error($Form->getError());
        }
    }
    public function read($id = 0)
    {
        $Form = M('Form');
        $result = $Form->find($id);
        $this->assign('data', $result);
        $this->display();
    }
    public function edit($id = 0)
    {
        $Form = M('Form');
        $result = $Form->find($id);
        $this->assign('vo', $result);
        $this->display();
    }
    public function update()
    {
        $Form = D('Form');
        if ($Form->create()) {
            //save方法会自动识别数据对象中的主键字段,并作为更新条件。
            $result = $Form->save();
            if ($result) {
                $this->success('数据更新成功!');
            } else {
                $this->error('数据更新失败!');
            }
        } else {
            $this->error($Form->getError());
        }
    }
    // 查询方式
    public function select_data()
    {
        // 方式一
        $User = M('User');
        // SELECT * FROM think_user WHERE type=1 AND status=1
        $User->where('type=1 AND status=1')->select();
        // 方式二
        $condition['type'] = 1;
        $condition['status'] = 1;
        $User->where($condition)->select();
        // OR
        // SELECT * FROM think_user WHERE type=1 OR status=1
        $condition['type'] = 1;
        $condition['status'] = 1;
        $condition['_logic'] = 'OR';
        $User->where($condition)->select();
    }
    public function serach_data()
    {
        // (a like '%thinkphp%' OR a like '%tp') AND (b not like '%thibkphp%' AND b not like '%tp')
        $map['a'] = array('like', array('%thinkphp%', '%tp'), 'OR');
        $map['b'] = array('notlike', array('%thinkphp%', '%tp'), 'AND');
        $map['id'] = array('between', '1,8');
        $map['id'] = array('not in', '1,5,8');
        // EXP
        $map['id'] = array('exp', 'IN(1,3,8)');
        $User = M('User');
        $data['name'] = 'ThinkPHP';
        $data['score'] = array('exp', 'score+1');
        $User->where('id=5')->save($data);
        // name='thinkphp' OR title='thinkphp'
        $map['name|title'] = 'thinkphp';
        $User->where($map)->select();
        // status=1 AND title='thinkphp'
        $map['status&title'] = array('1', 'thinkphp', '_multi' => true);
        $User->where($map)->select();
        // status=1 AND score>0 AND title='thinkphp';
        $map['status&score&title'] = array('1', array('gt', '0'), '_multi' => true);
        $User->where($map)->select();
        // (`id`>1)AND(`id`<10)
        $map['id'] = array(array('gt', 1), array('lt', 10));
        // (`id`>3)OR(`id`<10)
        $map['id'] = array(array('gt', 3), array('lt', 10), 'or');
        // (`id`!=6)AND(`id`>3)
        $map['id'] = array(array('neq', 6), array('gt', 3), 'and');
        // (`name` LIKE '%a%') OR (`name` LIKE '%%b') OR (`name` LIKE '%c%') OR (`name`='ThinkPHP')
        $map['name'] = array(array('like', '%a%'), array('like', '%b%'), array('like', '%c%'), 'ThinkPHP', 'or');
    }
    // 组合查询---字符串模式查询(_string)、复合查询(_complex)、请求字符串查询(_query)
    public function zh_search()
    {
        $User = M('User');
        //(`id`!=1) AND (`name`='ok') AND (status=1 AND score>10)
        $map['id'] = array('neq', 1);
        $map['name'] = 'ok';
        $map['_string'] = 'status=1 AND score>10';
        $User->where($map)->select();
        // `id`>100 AND (`stauts`='1' OR `score`='100')
        $map['id'] = array('gt', '100');
        $map['_query'] = 'status=1&score=100&_logic=or';
        // (id>1) AND ((name like '%thinkphp%') OR (title like '%thinkphp%'))
        $where['name'] = array('like', '%thinkphp%');
        $where['title'] = array('like', '%thinkphp%');
        $where['_logic'] = 'or';
        $map['_complex'] = $where;
        $map['id'] = array('gt', 1);
    }
}
