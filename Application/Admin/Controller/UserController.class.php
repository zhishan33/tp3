<?php
namespace Admin\Controller;
use Think\Controller;
class UserController extends Controller {
    public function index(){
        $this->show('<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} body{ background: #fff; font-family: "微软雅黑"; color: #333;font-size:24px} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.8em; font-size: 36px } a,a:hover{color:blue;}</style><div style="padding: 24px 48px;"> <h1>:)</h1><p>欢迎使用 <b>ThinkPHP</b>！</p><br/>版本 V{$Think.version}</div><script type="text/javascript" src="http://ad.topthink.com/Public/static/client.js"></script><thinkad id="ad_55e75dfae343f5a1"></thinkad><script type="text/javascript" src="http://tajs.qq.com/stats?sId=9347272" charset="UTF-8"></script>','utf-8');
    }
	public function read() {
		$New = M('User');
		if (isset($_GET['id'])) {
			$data = $New -> field($_GET['id']);
		} elseif (isset($_GET['name'])) {
			$data = $New -> getByName($_GET['name']);
		}
		$this -> data = $data;
		$this -> display();
	}

	public function archive() {
		$New = M('User');
		$year = $_GET['year'];
		$month = $_GET['month'];
		$begin_time = strtotime($year . $month . "01");
		$end_time = strtotime("+1 month", $begin_time);
		$map['create_time'] = array( array('gt', $begin_time), array('lt', $end_time));
		$map['status'] = 1;
		$list = $New -> where($map) -> select();
		$this -> list = $list;
		$this -> display();
	}
}