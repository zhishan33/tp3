<?php
namespace Admin\Controller;
use Think\Controller;
/**
 *
 */
class NewsController extends Controller {

	public function read() {
		$New = M('User');
		if (isset($_GET['id'])) {
			$data = $New -> find($_GET['id']);
			echo "string".$data;
		} elseif (isset($_GET['name'])) {
			$data = $New -> getByName($_GET['name']);
			echo "string2".$data;
		}
//		dump($data);
		$this -> data = $data;
//		$this->assign('data',$data);
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
//		dump($list);
		$this -> display();
	}

	public function add() {

	}

}
