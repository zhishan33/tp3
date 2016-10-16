<?php
namespace Home\Model;
use Think\Model;
/**
 * 
 */
class UserModel extends Model {
	
	protected $_validate = array(
		array('type','require','类型必填'),
	);
	protected $_auto = array(
		array('create_time','time',1,'function'),
	);
}
