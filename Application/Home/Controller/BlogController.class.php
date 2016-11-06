<?php
namespace Home\Controller;
use Think\Controller;
/**
 *
 */
class BlogController extends Controller {

	function read($id = 0) {
		echo 'id=' . $id;
	}

	public function archive($year = '2016', $month = '01') {
		echo "year=" . $year . '&month=' . $month;
	}

}
