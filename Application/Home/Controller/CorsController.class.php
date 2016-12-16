<?php
namespace Home\Controller;
use Think\Controller;
use Think\Model;
/**
 *
 */
header("Access-Control-Allow-Origin: http://192.168.4.153:8020");
class CorsController extends Controller {

	function index() {
		$connection = array('db_type' => 'mysql', 'db_host' => '121.41.109.230', 'db_user' => '58fangdai', 'db_pwd' => 'fangdai58', 'db_port' => 3306, 'db_name' => '58fangdai', 'db_charset' => 'utf8',
		//			'DB_PREFIX' =>  'tuo_',
		);
		//		$address = new \Admin\Model\AddressModel('address','ea_',$connection);
		//		$address = new \Think\Model('address','ea_',$connection);
		$address = M('address', 'ea_', $connection);
		$map['id'] = array('gt', 5);
		$data['arr'] = $address -> field('sheng', 'shi', 'qu') -> where($map) -> select();
		$data['html5'] = 'test html5跨域请求头部包含信息<br/>Access-Control-Allow-Origin: http://192.168.4.153:8020';
		$this -> ajaxReturn($data);
	}

	public function emptyModel() {
		//使用原生SQL查询的话，不需要使用额外的模型类，实例化一个空模型类即可进行操作了
		$Model = new Model();
		$Model = M();
		$result = $Model -> query('SELECT * FROM think_user WHERE status = 1');
		$this -> ajaxReturn($result);
	}
	public function EimgUpload() {
		echo I('file');   
        if (!empty($_FILES)) {   
            //如果有文件上传 上传附件   
            $this->_imgUpload();   
            //$this->forward();   
        }   
    }   
	public function imgUpload() {
//		$upload = new \Think\Upload();
		//设置上传文件大小
		//		$upload -> maxSize = 3292200;
		//设置上传文件类型
//		$upload -> allowExts = explode(',', 'jpg,gif,png,jpeg');
		//设置附件上传目录
		//		$upload -> savePath = './Uploads/';
//		$upload -> savePath = './Public/Uploads/';
		$upload = new \Think\Upload();// 实例化上传类
	    $upload->maxSize   =     3145728 ;// 设置附件上传大小
	    $upload->exts      =     array('jpg', 'gif', 'png', 'jpeg');// 设置附件上传类型
	    $upload->rootPath  =     './Public/Uploads/'; // 设置附件上传根目录
	    $upload->savePath  =     ''; // 设置附件上传（子）目录
	    // 上传文件 
	    $info   =   $upload->upload();
	    if(!$info) {// 上传错误提示错误信息
//	        $this->error($upload->getError());
//			return $upload->getError();
			$this->ajaxReturn($upload->getError());
	    }else{// 上传成功
//	        $this->success('上传成功！');
//			return "上传成功";
			$this->ajaxReturn("上传成功");
	    }
	}
	public function imgUploadInfo()
	{
		$data = "上传服务器成功";
		$this->ajaxReturn($data);
	}
	public function sendMessage()
	{
		$message['success'] = "success";
		$this->ajaxReturn($message);
	}
	public function lookbill()
	{
		$this->display();
	}
	public function search()
	{
		$order = M('Order');
		$search = I("search");
		$map['username|userid|userphone'] = array('like',"%".$search."%");
		$record = $order->where($map)->select();
//		dump($record);
		
//		if($search == 0){
//			$result['len'] = 0;
//			$this->ajaxReturn($result);
//		}
//		if($search == 1){
//			$result['len'] = 1;
//			$this->ajaxReturn($result);
//		}
//		if($search > 1){
//			$result['len'] = 2;
//			$result['record'] = array('应小强-600-12-苏州市','应小强-400-12-行州市');;
//			$this->ajaxReturn($result);
//		}
//		if(count($record) == 2){
//			$result['len'] = 2;
//			$result['record'] = array('应小强-600-12-苏州市','应小强-400-12-行州市');
//			$this->ajaxReturn($result);
//		}
		$ip = get_client_ip();
		if(count($record) == 0){
			$result['len'] = 0;
			$result['ip'] = $ip;
			$this->ajaxReturn($result);
		}
		if(count($record) == 1){
			$result['len'] = 1;
			$result['ip'] = $ip;
			$this->ajaxReturn($result);
		}
		if(count($record) > 1){
			$result['len'] = count($record);
			$result['record'] = $record;
			$result['ip'] = $ip;
			$this->ajaxReturn($result);
		}
		
	}
}
