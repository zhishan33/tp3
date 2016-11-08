<?php
return array(
//'配置项'=>'配置值'
// 设置禁止访问的模块列表
//'MODULE_DENY_LIST' => array('Common', 'Runtime', 'Api'),
//设置访问列表
//'MODULE_ALLOW_LIST'    =>    array('Home','Admin','User'),
//'DEFAULT_MODULE'       =>    'Home',
// 关闭多模块访问
//'MULTI_MODULE'          =>  false,
//'DEFAULT_MODULE'        =>  'Home',
//'配置项'=>'配置值'
//不区分URL大小写
//'URL_CASE_INSENSITIVE' =>true,
//设置禁止访问的URL后缀
'URL_DENY_SUFFIX' => 'pdf|ico|png|gif|jpg', 
// 添加数据库配置信息
'DB_TYPE' => 'mysql', // 数据库类型
'DB_HOST' => '127.0.0.1', // 服务器地址
'DB_NAME' => 'thinkphp', // 数据库名
'DB_USER' => 'root', // 用户名
'DB_PWD' => 'root', // 密码
'DB_PORT' => 3306, // 端口
'DB_PREFIX' => 'think_', // 数据库表前缀
'DB_CHARSET' => 'utf8', // 数据库字符集
//'ACTION_BIND_CLASS' => true, //操作绑定到类
//'DB_PARAMS'    =>    array(\PDO::ATTR_CASE => \PDO::CASE_NATURAL),
'index/:id\d|md5' => 'Index/index', 
'URL_ROUTER_ON' => true, 
'URL_MAP_RULES' => array('new/top' => 'news/index?type=top'), 'URL_ROUTE_RULES' => array('test' => function() {
	echo 'just test';
	}, 
	'hello/:name' => function($name) {
		echo 'Hello,' . $name;
	}, 
	'blog/:year/:month' => function($year, $month) {
		echo 'year=' . $year . '&month=' . $month;
	}, 
//	'/^new\/(\d{4})\/(\d{2})$/' => function($year, $month) {
//		echo 'year=' . $year . '&month=' . $month;
//	},
	'hello2/:name' => 
	    function($name){ 
	        echo 'Hello,'.$name.'<br/>';
	        $_SERVER['PATH_INFO'] = 'index/read/name/'.$name;
	        return false;
	},
//	'new/:id\d$' => 'News/read',
//	'new/:name$' => 'News/read',
//	'new/:year\d/:month\d$' => 'News/archive',
	
	'/^new\/(\d+)$/' => 'News/read?id=:1',
	'/^new\/(\w+)$/' => 'News/read?name=:1',
	'/^new\/(\d{4})\/(\d{2})$/' => 'News/archive?year=:1&month=:2',
	
	'new2/:id\d' => 'User/read',
	'new2/:name' => 'User/read',
	'new2/:year\d/:month\d' => 'User/archive',
	)
	

);
