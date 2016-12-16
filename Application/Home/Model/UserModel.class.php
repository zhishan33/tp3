<?php
namespace Home\Model;
use Think\Model;
/**
 * 
 */
class UserModel extends Model {
	
	protected $_validate = array(
		array('type','require','类型必填'),
		array('name', 'require', '用户名必填！'), 
		array('name', '', '账号已存在！', 1, 'unique', 1), 
		array('email', 'email', 'Email格式错误', 2), 
		array('password', '6,30', '密码长度不正确', 0, 'length'), 
		array('repassword', 'password', '确认密码不一致', 0, 'confirm'),
	);
	protected $_auto = array(
		array('create_time','time',1,'function'),
		array('password', 'md5', 3, 'function'), 
	);
	protected $fields = array('id','name','email','status');
	protected $pk = 'id';//主键，默认id
}
